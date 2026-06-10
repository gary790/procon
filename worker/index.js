/* ProCon — Cloudflare Worker (Static Assets + contact API)
   Static files are served from the asset binding (ASSETS). The Worker only
   runs for non-asset paths — here, POST /api/contact, which emails the lead
   to ProCon and sends the customer a confirmation via Resend.

   Required Worker env var (Settings > Variables and Secrets):
     RESEND_API_KEY   — Resend API key (secret)
     TURNSTILE_SECRET — Cloudflare Turnstile secret key (secret); bot protection
   Optional:
     MAIL_FROM        — verified sender, default "ProCon LLC <info@proconmn.com>"
     LEAD_TO          — where leads go, default "info@proconmn.com"
   (Sending from noreply@proconmn.com requires verifying proconmn.com in Resend.) */

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

/* Full name: at least two words (first + last), each 2+ chars, real-name
   characters only (letters incl. accents, hyphens, apostrophes, periods). */
const isFullName = (s) => {
  if (s.length < 5 || s.length > 80) return false;
  if (/https?:\/\/|www\.|[<>{}\[\]@#$%^*_=+~|\\\/0-9]/.test(s)) return false;
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return false;
  return parts.every((p) => /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'.-]+$/.test(p) && p.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, '').length >= 2);
};

/* Valid US phone (NANP): 10 digits after stripping an optional leading 1;
   area code and exchange must start 2-9; reject obvious junk patterns. */
const usPhone = (s) => {
  let dg = s.replace(/\D/g, '');
  if (dg.length === 11 && dg[0] === '1') dg = dg.slice(1);
  if (dg.length !== 10) return null;
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(dg)) return null;
  if (/^(\d)\1{9}$/.test(dg)) return null;            // 5555555555 etc.
  if (/(\d)\1{6,}/.test(dg)) return null;              // 7+ same digit run
  if (dg === '1234567890' || dg.slice(3) === '1234567') return null;
  if (dg.slice(0, 3) === '555' || dg.slice(3, 6) === '555') return null; // fictional
  return dg;
};

/* Spam heuristics on the free-text message. */
const looksSpammy = (msg) => {
  const links = (msg.match(/https?:\/\/|www\./gi) || []).length;
  if (links > 0) return true;                          // contractors call, they don't link
  if (/\b(SEO|backlinks?|crypto|bitcoin|loan|viagra|casino|porn|escort|followers|ranking on google|web design services|boost your)\b/i.test(msg)) return true;
  if (/[\u0400-\u04FF\u4E00-\u9FFF]/.test(msg)) return true; // Cyrillic/CJK blocks
  return false;
};

/* Verify the Cloudflare Turnstile token. Fails closed when the secret is set. */
async function verifyTurnstile(token, ip, env) {
  if (!env.TURNSTILE_SECRET) return true; // not configured -> skip (other layers still apply)
  if (!token) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip }),
    });
    const d = await r.json();
    return !!d.success;
  } catch {
    return false;
  }
}

/* Best-effort per-IP rate limit (per isolate): max 3 submissions / 10 min. */
const rlMap = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const hits = (rlMap.get(ip) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  rlMap.set(ip, hits);
  if (rlMap.size > 5000) rlMap.clear(); // memory guard
  return hits.length > 3;
}

async function handleContact(request, env) {
  let d = {};
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) d = await request.json();
    else { const fd = await request.formData(); fd.forEach((v, k) => { d[k] = v; }); }
  } catch { return json({ success: false, message: 'Bad request.' }, 400); }

  if (d.botcheck) return json({ success: true }); // honeypot

  const ip = request.headers.get('cf-connecting-ip') || '';
  if (rateLimited(ip)) return json({ success: false, message: 'Too many requests — please call us instead.' }, 429);

  const name = (d.name || '').toString().trim().replace(/\s+/g, ' ');
  const email = (d.email || '').toString().trim();
  const phone = (d.phone || '').toString().trim();
  const project = (d.project_type || d.project || '').toString().trim();
  const city = (d.city || '').toString().trim();
  const message = (d.message || '').toString().trim();

  if (!isFullName(name))
    return json({ success: false, message: 'Please enter your first and last name.' }, 422);
  if (!isEmail(email))
    return json({ success: false, message: 'Please enter a valid email address.' }, 422);
  const cleanPhone = usPhone(phone);
  if (!cleanPhone)
    return json({ success: false, message: 'Please enter a valid US phone number.' }, 422);
  if (!project || project.length > 60)
    return json({ success: false, message: 'Please complete the required fields.' }, 422);
  if (city.length > 80 || message.length > 4000)
    return json({ success: false, message: 'Please complete the required fields.' }, 422);
  if (looksSpammy(message) || looksSpammy(city))
    return json({ success: false, message: 'Your message could not be sent. Please call us at (218) 348-2076.' }, 422);

  const tsOK = await verifyTurnstile((d['cf-turnstile-response'] || d.turnstile || '').toString(), ip, env);
  if (!tsOK)
    return json({ success: false, message: 'Verification failed — please try again or call us.' }, 403);

  const KEY = env.RESEND_API_KEY;
  if (!KEY) return json({ success: false, message: 'Email is not configured yet.' }, 500);
  const FROM = env.MAIL_FROM || 'ProCon LLC <info@proconmn.com>';
  const TO = env.LEAD_TO || 'info@proconmn.com';

  const send = (payload) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

  const leadHtml =
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#13171A;font-size:15px;line-height:1.6">` +
    `<h2 style="font-size:18px;margin:0 0 12px">New estimate request</h2>` +
    `<p><strong>Name:</strong> ${esc(name)}<br><strong>Email:</strong> ${esc(email)}<br>` +
    `<strong>Phone:</strong> ${esc(phone)}<br><strong>Project:</strong> ${esc(project)}<br>` +
    `<strong>City / area:</strong> ${esc(city || '—')}</p>` +
    `<p><strong>Details:</strong><br>${esc(message || '—').replace(/\n/g, '<br>')}</p>` +
    `<hr style="border:none;border-top:1px solid #ddd;margin:18px 0">` +
    `<p style="color:#666;font-size:13px">Sent from the contact form at proconmn.com</p></div>`;

  const leadResp = await send({
    from: FROM, to: [TO], reply_to: email,
    subject: `New estimate request — ${name}${city ? ' (' + city + ')' : ''}`, html: leadHtml,
  });
  if (!leadResp.ok) {
    const detail = await leadResp.text().catch(() => '');
    return json({ success: false, message: 'We could not send your request. Please call us.', detail }, 502);
  }

  const first = (name.split(/\s+/)[0] || name);
  const confHtml =
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#13171A;font-size:15px;line-height:1.7;max-width:520px">` +
    `<p>Hi ${esc(first)},</p>` +
    `<p>Thanks for reaching out to <strong>ProCon</strong> — we've received your request` +
    `${project ? ` about your ${esc(project).toLowerCase()}` : ''} and <strong>we'll be in touch within one business day</strong>, usually sooner.</p>` +
    `<p>If it's urgent, you can reach Dan directly at <a href="tel:+12183482076" style="color:#B07A37">(218) 348-2076</a>.</p>` +
    `<p style="margin-top:22px;color:#585C5C;font-size:13px">— ProCon LLC · Duluth, MN<br>` +
    `Custom homes &amp; remodeling across Northern Minnesota · MN&nbsp;#QB807406</p></div>`;
  try { await send({ from: FROM, to: [email], subject: 'We got your request — ProCon LLC', html: confHtml }); } catch (_) {}

  return json({ success: true });
}

/* ---- Google reviews (Places API) ----
   Required env vars to go live:
     GOOGLE_PLACES_API_KEY — Google Cloud API key with Places API enabled (secret)
     GOOGLE_PLACE_ID       — the ProCon LLC place ID from Google Business Profile
   Until both are set, /api/reviews returns { configured:false } and the
   reviews page shows its graceful fallback. Responses are edge-cached 6h. */
async function handleReviews(request, env, ctx) {
  const KEY = env.GOOGLE_PLACES_API_KEY;
  const PLACE = env.GOOGLE_PLACE_ID;
  if (!KEY || !PLACE) return json({ configured: false });

  const cache = caches.default;
  const cacheKey = new Request('https://cache.proconmn.com/api/reviews');
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const fields = 'rating,userRatingCount,googleMapsUri,reviews';
  const resp = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(PLACE)}?fields=${fields}`, {
    headers: { 'X-Goog-Api-Key': KEY },
  });
  if (!resp.ok) return json({ configured: true, error: 'Could not load reviews right now.' }, 502);
  const place = await resp.json();

  const body = {
    configured: true,
    rating: place.rating || null,
    count: place.userRatingCount || 0,
    url: place.googleMapsUri || null,
    reviews: (place.reviews || []).map((r) => ({
      author: r.authorAttribution?.displayName || 'Google user',
      photo: r.authorAttribution?.photoUri || null,
      rating: r.rating || null,
      time: r.relativePublishTimeDescription || '',
      text: r.text?.text || r.originalText?.text || '',
    })),
  };
  const out = new Response(JSON.stringify(body), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=21600' },
  });
  ctx.waitUntil(cache.put(cacheKey, out.clone()));
  return out;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Canonical host: redirect apex -> www (301, preserves path + query).
    if (url.hostname === 'proconmn.com') {
      url.hostname = 'www.proconmn.com';
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === '/api/contact') {
      return request.method === 'POST'
        ? handleContact(request, env)
        : json({ success: false, message: 'Method not allowed.' }, 405);
    }
    if (url.pathname === '/api/reviews') {
      return request.method === 'GET'
        ? handleReviews(request, env, ctx)
        : json({ success: false, message: 'Method not allowed.' }, 405);
    }
    // Everything else is a static asset.
    return env.ASSETS.fetch(request);
  },
};
