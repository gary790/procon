/* PRO CON — North Shore Monolith — interaction layer */
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
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el, { offset: -90 });
      else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
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

  /* ---- Header state (paper over hero -> stuck) ---- */
  var head = document.getElementById('head');
  var hero = document.getElementById('hero');
  if (head) {
    var onScroll = function () {
      var y = window.scrollY;
      head.classList.toggle('is-stuck', y > 40);
      if (hero) head.classList.toggle('on-dark', y < hero.offsetHeight - 90);
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
    burger.addEventListener('click', function () { setDrawer(!drawer.classList.contains('is-open')); });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });
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

  /* ---- Magnetic buttons + custom cursor (desktop, fine pointer) ---- */
  if (finePointer && !reduce) {
    var cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy, shown = false;
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; cursor.classList.add('is-active'); }
    });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, summary, [data-magnetic]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('is-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-hover'); });
    });
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
  var addr = 'danb.procon' + '@' + 'gmail.com';
  document.querySelectorAll('a[data-show]').forEach(function (em) { em.href = 'mailto:' + addr; em.textContent = addr; });

  /* ---- Conversion events (no-op until GA4 id wired) ---- */
  function track(n, p) { if (typeof window.gtag === 'function') window.gtag('event', n, p || {}); }
  document.querySelectorAll('a[href^="tel:"]').forEach(function (a) { a.addEventListener('click', function () { track('phone_click', { phone: a.getAttribute('href') }); }); });

  /* ---- Estimate form: validation, honeypot, async submit, success state ---- */
  var form = document.getElementById('estimate-form');
  if (form) {
    var required = ['name', 'email', 'phone', 'project'];
    var fieldOf = { name: 'f-name', email: 'f-email', phone: 'f-phone', project: 'f-type' };
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validate(id) {
      var input = document.getElementById(id);
      var field = document.getElementById(fieldOf[id]);
      if (!input || !field) return true;
      var v = (input.value || '').trim();
      var ok = !!v;
      if (id === 'email') ok = emailRe.test(v);
      if (id === 'phone') ok = v.replace(/\D/g, '').length >= 10;
      field.classList.toggle('field--error', !ok);
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
          if (res.ok && res.d && res.d.success) { form.classList.add('is-sent'); track('form_submit', { form_name: 'estimate' }); window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 120, behavior: reduce ? 'auto' : 'smooth' }); }
          else { throw new Error('send failed'); }
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.style.opacity = ''; btn.firstChild.textContent = 'Request an Estimate'; }
          var note = form.querySelector('.form__note');
          if (note) note.innerHTML = 'Something went wrong sending that. Please call <a href="tel:+12183482076" class="ulink">(218) 348-2076</a> or email us directly.';
        });
    });
  }
})();
