/* ProCon — live Google reviews loader */
(function () {
  var grid = document.getElementById('rv-grid');
  var summ = document.getElementById('rv-summary');
  var foot = document.getElementById('rv-foot');
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
  function stars(n) {
    var out = '';
    for (var i = 1; i <= 5; i++) out += i <= Math.round(n) ? '\u2605' : '\u2606';
    return '<span class="rv__stars" aria-label="' + n + ' out of 5 stars">' + out + '</span>';
  }
  function fallback() {
    grid.innerHTML =
      '<div class="rv__empty">' +
      '<p class="h-sub" style="font-family:var(--clash);font-weight:600">Reviews are on their way.</p>' +
      '<p style="color:var(--ink-soft);margin-top:.8rem;max-width:52ch">We&rsquo;re connecting this page to our Google Business Profile so you can read every review, unedited, straight from Google. In the meantime &mdash; ask us for references. We&rsquo;ll happily put you in touch with past clients.</p>' +
      '<p style="margin-top:1.4rem"><a class="btn btn--ghost" href="https://www.google.com/search?q=ProCon+LLC+Duluth+MN+reviews" rel="noopener" target="_blank">Find us on Google</a></p>' +
      '</div>';
  }
  fetch('/api/reviews').then(function (r) { return r.json(); }).then(function (d) {
    if (!d || !d.configured || !d.reviews || !d.reviews.length) { fallback(); return; }
    if (d.rating) {
      summ.innerHTML = '<p class="rv__big">' + stars(d.rating) + ' <strong>' + d.rating.toFixed(1) + '</strong>' +
        (d.count ? ' <span style="color:var(--mist)">&middot; ' + d.count + ' Google reviews</span>' : '') + '</p>';
    }
    grid.innerHTML = d.reviews.map(function (r) {
      return '<article class="rv__card" data-reveal>' +
        '<header class="rv__head">' +
        (r.photo ? '<img class="rv__ava" src="' + esc(r.photo) + '" alt="" width="40" height="40" loading="lazy" referrerpolicy="no-referrer">' : '') +
        '<div><p class="rv__name">' + esc(r.author) + '</p><p class="rv__time">' + esc(r.time) + '</p></div>' +
        '</header>' +
        (r.rating ? stars(r.rating) : '') +
        '<p class="rv__text">' + esc(r.text) + '</p>' +
        '</article>';
    }).join('');
    if (d.url) foot.innerHTML = '<a class="btn btn--ghost" href="' + esc(d.url) + '" rel="noopener" target="_blank">Read all reviews on Google</a>';
    if (window.__reattachReveals) window.__reattachReveals();
    else grid.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
  }).catch(fallback);
})();
