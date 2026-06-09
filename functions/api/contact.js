/* Cloudflare Pages Function — POST /api/contact
   Receives the estimate form, emails the lead to Pro Con, and sends the
   customer a confirmation ("we'll be in touch"). Uses Resend.

   Required Cloudflare env vars (Pages > Settings > Environment variables):
     RESEND_API_KEY   — your Resend API key (secret)
   Optional:
     MAIL_FROM        — verified sender, default "Pro Con LLC <noreply@proconmn.com>"
     LEAD_TO          — where leads go, default "danb.procon@gmail.com"
   (Sending from noreply@proconmn.com requires verifying proconmn.com in Resend.) */

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });

const esc = (s) => String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function onRequestPost({ request, env }) {
  let d = {};
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) d = await request.json();
    else { const fd = await request.formData(); fd.forEach((v, k) => { d[k] = v; }); }
  } catch { return json({ success: false, message: 'Bad request.' }, 400); }

  // Honeypot — pretend success, send nothing.
  if (d.botcheck) return json({ success: true });

  const name = (d.name || '').toString().trim();
  const email = (d.email || '').toString().trim();
  const phone = (d.phone || '').toString().trim();
  const project = (d.project_type || d.project || '').toString().trim();
  const city = (d.city || '').toString().trim();
  const message = (d.message || '').toString().trim();

  if (!name || !isEmail(email) || phone.replace(/\D/g, '').length < 10 || !project)
    return json({ success: false, message: 'Please complete the required fields.' }, 422);

  const KEY = env.RESEND_API_KEY;
  if (!KEY) return json({ success: false, message: 'Email is not configured yet.' }, 500);
  const FROM = env.MAIL_FROM || 'Pro Con LLC <noreply@proconmn.com>';
  const TO = env.LEAD_TO || 'danb.procon@gmail.com';

  const send = (payload) =>
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

  // 1) Lead notification to Pro Con (reply-to the customer)
  const leadHtml =
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#13171A;font-size:15px;line-height:1.6">` +
    `<h2 style="font-size:18px;margin:0 0 12px">New estimate request</h2>` +
    `<p><strong>Name:</strong> ${esc(name)}<br>` +
    `<strong>Email:</strong> ${esc(email)}<br>` +
    `<strong>Phone:</strong> ${esc(phone)}<br>` +
    `<strong>Project:</strong> ${esc(project)}<br>` +
    `<strong>City / area:</strong> ${esc(city || '—')}</p>` +
    `<p><strong>Details:</strong><br>${esc(message || '—').replace(/\n/g, '<br>')}</p>` +
    `<hr style="border:none;border-top:1px solid #ddd;margin:18px 0">` +
    `<p style="color:#666;font-size:13px">Sent from the contact form at proconmn.com</p></div>`;

  const leadResp = await send({
    from: FROM, to: [TO], reply_to: email,
    subject: `New estimate request — ${name}${city ? ' (' + city + ')' : ''}`,
    html: leadHtml,
  });
  if (!leadResp.ok) {
    const detail = await leadResp.text().catch(() => '');
    return json({ success: false, message: 'We could not send your request. Please call us.', detail }, 502);
  }

  // 2) Confirmation to the customer (best-effort — never block on this)
  const first = (name.split(/\s+/)[0] || name);
  const confHtml =
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#13171A;font-size:15px;line-height:1.7;max-width:520px">` +
    `<p>Hi ${esc(first)},</p>` +
    `<p>Thanks for reaching out to <strong>Pro Con</strong> — we've received your request` +
    `${project ? ` about your ${esc(project).toLowerCase()}` : ''} and <strong>we'll be in touch within one business day</strong>, usually sooner.</p>` +
    `<p>If it's urgent, you can reach Dan directly at <a href="tel:+12183482076" style="color:#B07A37">(218) 348-2076</a>.</p>` +
    `<p style="margin-top:22px;color:#585C5C;font-size:13px">— Pro Con LLC · Duluth, MN<br>` +
    `Custom homes &amp; remodeling across Northern Minnesota · MN&nbsp;#QB807406</p></div>`;

  try {
    await send({ from: FROM, to: [email], subject: 'We got your request — Pro Con LLC', html: confHtml });
  } catch (_) { /* confirmation is best-effort */ }

  return json({ success: true });
}

export const onRequest = (ctx) =>
  ctx.request.method === 'POST'
    ? onRequestPost(ctx)
    : json({ success: false, message: 'Method not allowed.' }, 405);
