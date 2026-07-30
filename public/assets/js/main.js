/* PROCON — North Shore Monolith — interaction layer */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---- Smooth scroll (Lenis) ---- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
  // Anchor links route through Lenis (with sticky-header offset)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      // The href may have been rewritten after this listener was bound — the
      // obfuscated "Email us" links become mailto:, which querySelector throws on.
      var id = a.getAttribute('href') || '';
      if (id.charAt(0) !== '#' || id.length < 2) return;
      var el;
      try { el = document.querySelector(id); } catch (_) { return; }
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: -90 });
      else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      // Scrolling alone leaves keyboard focus behind, so "Skip to content" would
      // dump the user back into the header on their next Tab. Move focus too.
      if (!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
        el.setAttribute('tabindex', '-1');
      }
      try { el.focus({ preventScroll: true }); } catch (_) { el.focus(); }
    });
  });

  /* ---- Reveal on scroll ---- */
  var revealables = document.querySelectorAll('[data-reveal], .reveal-line');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- Header state (collapse top-bar when stuck) ---- */
  var head = document.getElementById('head');
  if (head) {
    var onScroll = function () {
      head.classList.toggle('is-stuck', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile drawer ---- */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  function setDrawer(open) {
    if (!drawer || !burger) return;
    drawer.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (lenis) { open ? lenis.stop() : lenis.start(); }
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      var open = !drawer.classList.contains('is-open');
      setDrawer(open);
      if (open) { var f = drawer.querySelector('a, button'); if (f) f.focus(); }
      else burger.focus();
    });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
    document.addEventListener('keydown', function (e) {
      if (!drawer.classList.contains('is-open')) return;
      if (e.key === 'Escape') { setDrawer(false); burger.focus(); return; }
      // Keep Tab inside the open drawer, and out of the page behind it.
      if (e.key === 'Tab') {
        var f = drawer.querySelectorAll('a, button');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!drawer.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---- FAQ: single open ---- */
  var faqs = document.querySelectorAll('details.faq');
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---- Marquee: duplicate track for seamless loop ---- */
  document.querySelectorAll('.marquee__t').forEach(function (t) {
    t.innerHTML += t.innerHTML;
  });

  /* ---- Magnetic buttons (desktop, fine pointer) ---- */
  if (finePointer && !reduce) {
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var strength = 0.32;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + (e.clientX - (r.left + r.width / 2)) * strength + 'px,' + (e.clientY - (r.top + r.height / 2)) * strength + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---- Year, email obfuscation (all data-show links) ---- */
  var yr = document.getElementById('year'); if (yr) yr.textContent = String(new Date().getFullYear());
  var addr = 'info' + '@' + 'proconmn.com';
  document.querySelectorAll('a[data-show]').forEach(function (em) { em.href = 'mailto:' + addr; em.textContent = addr; });

  /* ---- Conversion events (no-op until GA4 id wired) ---- */
  function track(n, p) { if (typeof window.gtag === 'function') window.gtag('event', n, p || {}); }
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) { a.addEventListener('click', function () { track('phone_click', { phone: a.getAttribute('href') }); }); });

  /* ---- Estimate form: validation, honeypot, async submit, success state ---- */
  var form = document.getElementById('estimate-form');
  if (form) {
    var required = ['name', 'email', 'phone', 'project'];
    var fieldOf = { name: 'f-name', email: 'f-email', phone: 'f-phone', project: 'f-type' };
    // Kept deliberately in lockstep with worker/index.js \u2014 if this is looser the
    // server 422s a submission the customer was told was fine.
    var emailRe = /^[^\s@<>,;:"()[\]\\]+@[^\s@<>,;:"()[\]\\]+\.[A-Za-z]{2,}$/;
    var NAME_START = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF';
    var nameToken = new RegExp('^[' + NAME_START + '][' + NAME_START + "'\u2019.-]*$");

    function nameLetters(p) {
      return p.replace(new RegExp('[^' + NAME_START + ']', 'g'), '').length;
    }
    function isFullName(v) {
      v = v.replace(/\s+/g, ' ').trim();
      if (v.length < 4 || v.length > 80) return false;
      if (/https?:\/\/|www\.|[<>{}\[\]@#$%^*_=+~|\\\/0-9]/.test(v)) return false;
      var parts = v.split(' ');
      if (parts.length < 2) return false;
      for (var i = 0; i < parts.length; i++) {
        if (!nameToken.test(parts[i])) return false;   // allows O'Brien, O\u2019Brien, Mary-Jane, J.
      }
      // Surname must be a real word; a first/middle initial is fine.
      return nameLetters(parts[parts.length - 1]) >= 2 && nameLetters(parts[0]) >= 1;
    }
    function isUSPhone(v) {
      var dg = v.replace(/\D/g, '');
      if (dg.length === 11 && dg.charAt(0) === '1') dg = dg.slice(1);
      if (dg.length !== 10) return false;
      if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(dg)) return false;
      if (/^(\d)\1{9}$/.test(dg)) return false;
      return true;
    }

    function validate(id) {
      var input = document.getElementById(id);
      var field = document.getElementById(fieldOf[id]);
      if (!input || !field) return true;
      var v = (input.value || '').trim();
      var ok = !!v;
      if (id === 'name') ok = isFullName(v);
      if (id === 'email') ok = emailRe.test(v);
      if (id === 'phone') ok = isUSPhone(v);
      field.classList.toggle('field--error', !ok);
      // The red border and the .err text were visual-only; link them to the input
      // so screen readers announce which field failed and why.
      var err = field.querySelector('.err');
      if (err) {
        if (!err.id) err.id = fieldOf[id] + '-err';
        if (input.getAttribute('aria-describedby') !== err.id) input.setAttribute('aria-describedby', err.id);
      }
      if (ok) input.removeAttribute('aria-invalid');
      else input.setAttribute('aria-invalid', 'true');
      return ok;
    }
    required.forEach(function (id) {
      var input = document.getElementById(id);
      if (input) input.addEventListener('blur', function () { validate(id); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Honeypot — silently succeed-look without sending
      if (form.querySelector('[name="botcheck"]') && form.querySelector('[name="botcheck"]').checked) { form.classList.add('is-sent'); return; }

      var valid = true, firstBad = null;
      required.forEach(function (id) { var ok = validate(id); if (!ok && !firstBad) firstBad = id; valid = valid && ok; });
      if (!valid) { if (firstBad) document.getElementById(firstBad).focus(); return; }

      var btn = document.getElementById('submit-btn');
      if (btn) { btn.disabled = true; btn.style.opacity = '0.6'; btn.firstChild.textContent = 'Sending…'; }

      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (res.ok && res.d && res.d.success) {
            form.classList.add('is-sent'); track('form_submit', { form_name: 'estimate' });
            /* Push the lead to SagiFlo (lead board) — fire-and-forget */
            if (window.SagiFlo && typeof window.SagiFlo.capture === 'function') {
              try {
                window.SagiFlo.capture({
                  name: form.querySelector('[name="name"]').value,
                  email: form.querySelector('[name="email"]').value,
                  phone: form.querySelector('[name="phone"]').value,
                  message: 'Project: ' + (form.querySelector('[name="project_type"]').value || '—') +
                    (form.querySelector('[name="city"]').value ? ' | City: ' + form.querySelector('[name="city"]').value : '') +
                    (form.querySelector('[name="message"]').value ? ' | ' + form.querySelector('[name="message"]').value : '')
                });
              } catch (_) {}
            }
            window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 120, behavior: reduce ? 'auto' : 'smooth' });
            // .form__body (holding the focused submit button) is display:none'd on
            // success, which drops focus to the top of the document. Move it to
            // the confirmation so it is announced and keyboard order survives.
            var okPanel = form.querySelector('.form__ok');
            if (okPanel) {
              okPanel.setAttribute('tabindex', '-1');
              okPanel.setAttribute('role', 'status');
              try { okPanel.focus({ preventScroll: true }); } catch (_) { okPanel.focus(); }
            }
          }
          else {
            var err = new Error('send failed');
            // Carry the Worker's specific reason ("Please choose a project type
            // from the list.", "Too many requests…") instead of discarding it.
            err.serverMessage = (res.d && typeof res.d.message === 'string') ? res.d.message : '';
            throw err;
          }
        })
        .catch(function (err) {
          if (btn) { btn.disabled = false; btn.style.opacity = ''; btn.firstChild.textContent = 'Request an Estimate'; }
          if (window.turnstile) { try { window.turnstile.reset(); } catch (_) {} }
          var note = form.querySelector('.form__note');
          if (!note) return;
          var msg = (err && err.serverMessage) || 'Something went wrong sending that.';
          // textContent (not innerHTML) so a server string can never inject markup.
          note.textContent = msg + ' ';
          var tel = document.createElement('a');
          tel.href = 'tel:+12183482076'; tel.className = 'ulink'; tel.textContent = '(218) 348-2076';
          note.appendChild(document.createTextNode('Or call '));
          note.appendChild(tel);
          note.appendChild(document.createTextNode('.'));
          note.setAttribute('role', 'alert');
        });
    });
  }

  /* ---- Live Duluth weather (Open-Meteo, no key) ---- */
  var wx = document.getElementById('wx');
  if (wx && 'fetch' in window) {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=46.84&longitude=-92.05&current=temperature_2m,weather_code&temperature_unit=fahrenheit')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.current) return;
        var t = Math.round(d.current.temperature_2m);
        var code = d.current.weather_code;
        var sky = 'clear';
        if (code >= 71 && code <= 77 || code === 85 || code === 86) sky = 'snowing';
        else if (code >= 51 && code <= 67 || code >= 80 && code <= 82) sky = 'raining';
        else if (code === 45 || code === 48) sky = 'fog';
        else if (code >= 1 && code <= 3) sky = 'cloudy';
        else if (code >= 95) sky = 'storming';
        var line = (t <= 20) ? 'We build anyway.' : (t <= 40 ? 'Good building weather, by our standards.' : 'A fine day to pour footings.');
        var small = window.matchMedia && window.matchMedia('(max-width: 759px)').matches;
        wx.innerHTML = small
          ? '<i aria-hidden="true"></i><b>' + t + '\u00B0F</b>&nbsp; Duluth \u2014 ' + sky + '. ' + line
          : '<i aria-hidden="true"></i><b>' + t + '\u00B0F</b> in Duluth right now \u2014 ' + sky + '. ' + line;
        wx.classList.add('is-live');
      })
      .catch(function () { /* widget stays with its static fallback text */ });
  }

  /* ---- Image-break parallax ---- */
  var breaks = document.querySelectorAll('.imgbreak img');
  if (breaks.length && !reduce) {
    var ticking = false;
    var para = function () {
      breaks.forEach(function (img) {
        var r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight; // -.5 .. .5 ish
        img.style.transform = 'translateY(' + (p * -9) + '%)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(para); }
    }, { passive: true });
    para();
  }

  /* ---- Before / After slider ---- */
  document.querySelectorAll('.ba').forEach(function (ba) {
    var after = ba.querySelector('.ba__after');
    var handle = ba.querySelector('.ba__handle');
    if (!after || !handle) return;
    var dragging = false;
    function setPos(clientX) {
      var r = ba.getBoundingClientRect();
      var pct = Math.min(96, Math.max(4, ((clientX - r.left) / r.width) * 100));
      after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      handle.style.left = pct + '%';
      ba.setAttribute('aria-valuenow', String(Math.round(pct)));
      ba.setAttribute('aria-valuetext', Math.round(pct) + '% of the after photo shown');
    }
    ba.addEventListener('pointerdown', function (e) { dragging = true; ba.setPointerCapture(e.pointerId); setPos(e.clientX); });
    ba.addEventListener('pointermove', function (e) { if (dragging) setPos(e.clientX); });
    ba.addEventListener('pointerup', function () { dragging = false; });
    ba.addEventListener('pointercancel', function () { dragging = false; });
    // Keyboard support
    ba.setAttribute('tabindex', '0');
    ba.setAttribute('role', 'slider');
    // role="slider" makes this a leaf node, so the two <img> alts drop out of the
    // accessibility tree entirely. Fold them into the slider's own name.
    var baAlts = [];
    ba.querySelectorAll('img').forEach(function (im) { if (im.alt) baAlts.push(im.alt); });
    ba.setAttribute('aria-label', 'Before and after comparison slider' + (baAlts.length ? '. ' + baAlts.join('. ') : ''));
    ba.setAttribute('aria-valuemin', '0'); ba.setAttribute('aria-valuemax', '100'); ba.setAttribute('aria-valuenow', '50');
    ba.setAttribute('aria-valuetext', '50% of the after photo shown');
    ba.addEventListener('keydown', function (e) {
      var now = parseFloat(ba.getAttribute('aria-valuenow')) || 50;
      if (e.key === 'ArrowLeft') { e.preventDefault(); var r1 = ba.getBoundingClientRect(); setPos(r1.left + r1.width * (now - 4) / 100); }
      if (e.key === 'ArrowRight') { e.preventDefault(); var r2 = ba.getBoundingClientRect(); setPos(r2.left + r2.width * (now + 4) / 100); }
    });
  });

  /* ---- Gallery lightbox ---- */
  var galFigs = document.querySelectorAll('.gal figure');
  if (galFigs.length) {
    var lbox = document.createElement('div');
    lbox.className = 'lbox';
    lbox.setAttribute('role', 'dialog');
    lbox.setAttribute('aria-modal', 'true');
    lbox.setAttribute('aria-label', 'Image viewer');
    lbox.innerHTML = '<button class="lbox__x" aria-label="Close">&times;</button>'
      + '<button class="lbox__nav lbox__prev" aria-label="Previous image">&larr;</button>'
      + '<img alt="">'
      + '<button class="lbox__nav lbox__next" aria-label="Next image">&rarr;</button>'
      + '<p class="lbox__cap"></p>';
    document.body.appendChild(lbox);
    var lImg = lbox.querySelector('img'), lCap = lbox.querySelector('.lbox__cap'), idx = 0;
    var items = [];
    galFigs.forEach(function (fig, i) {
      var im = fig.querySelector('img'); if (!im) return;
      var capEl = fig.querySelector('figcaption .cap') || fig.querySelector('figcaption');
      items.push({ src: im.currentSrc || im.src, alt: im.alt || '', cap: capEl ? capEl.textContent : '' });
      var hit = fig.querySelector('.gal__media') || fig;
      hit.addEventListener('click', function () { openL(i); });
      hit.setAttribute('tabindex', '0');
      hit.setAttribute('role', 'button');
      hit.setAttribute('aria-label', 'View larger: ' + (im.alt || 'photo'));
      hit.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openL(i); } });
    });
    function show(i) {
      idx = (i + items.length) % items.length;
      lImg.src = items[idx].src; lImg.alt = items[idx].alt;
      lCap.textContent = items[idx].cap;
    }
    var lastFocus = null;
    var closeBtn = lbox.querySelector('.lbox__x');
    function openL(i) {
      lastFocus = document.activeElement;
      show(i); lbox.classList.add('is-open');
      document.documentElement.style.overflow = 'hidden'; if (lenis) lenis.stop();
      // aria-modal is a promise to the AT that focus lives inside the dialog.
      closeBtn.focus();
    }
    function closeL() {
      lbox.classList.remove('is-open');
      document.documentElement.style.overflow = ''; if (lenis) lenis.start();
      // Return focus to the thumbnail the user opened, not the top of the page.
      if (lastFocus && typeof lastFocus.focus === 'function') {
        try { lastFocus.focus({ preventScroll: true }); } catch (_) { lastFocus.focus(); }
      }
      lastFocus = null;
    }
    closeBtn.addEventListener('click', closeL);
    lbox.querySelector('.lbox__prev').addEventListener('click', function () { show(idx - 1); });
    lbox.querySelector('.lbox__next').addEventListener('click', function () { show(idx + 1); });
    lbox.addEventListener('click', function (e) { if (e.target === lbox) closeL(); });
    document.addEventListener('keydown', function (e) {
      if (!lbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') { closeL(); return; }
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
      // Keep Tab inside the dialog while it is open.
      if (e.key === 'Tab') {
        var f = lbox.querySelectorAll('button');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!lbox.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
    });
  }

})();
