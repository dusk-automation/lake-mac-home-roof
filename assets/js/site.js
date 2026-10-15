/* Lake Mac Home & Roof Co. — design preview by Dusk. Nothing on this site sends data anywhere. */
(function () {
  'use strict';
  window.__lmh = true;
  var root = document.documentElement;
  var motion = root.classList.contains('motion');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* moving between pages through the site's own links skips the intro */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (/^(https?:|mailto:|tel:|sms:|#)/.test(h)) return;
    try { sessionStorage.setItem('lmh-nav', '1'); } catch (x) {}
  });

  $$('[data-year]').forEach(function (n) { n.textContent = new Date().getFullYear(); });

  /* ---------- intro ---------- */
  function go() { root.classList.add('go'); setTimeout(function () { root.classList.add('ready'); }, 60); }
  var intro = $('.intro');
  if (intro && root.classList.contains('intro-on')) {
    var badge = $('.badge', intro), timers = [], finished = false;
    var at = function (ms, f) { timers.push(setTimeout(f, ms)); };
    var exit = function () {
      if (intro.classList.contains('s4')) return;
      intro.classList.add('s1', 's2', 's3');
      var logo = $('.hdr .brand img');
      if (logo && badge) {
        var a = badge.getBoundingClientRect(), b = logo.getBoundingClientRect();
        if (a.width && b.width) {
          var s = b.width / a.width;
          var dx = (b.left + b.width / 2) - (a.left + a.width / 2), dy = (b.top + b.height / 2) - (a.top + a.height / 2);
          badge.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + s + ')';
        }
      }
      intro.classList.add('s4');
      go();
      at(820, function () { root.classList.add('intro-done'); badge && (badge.style.opacity = '0'); });
      at(1150, end);
    };
    var end = function () {
      if (finished) return; finished = true;
      timers.forEach(clearTimeout);
      root.classList.remove('intro-on');
      root.classList.add('intro-done');
      intro.remove();
      go();
    };
    at(60, function () { intro.classList.add('s1'); });
    at(420, function () { intro.classList.add('s2'); });
    at(1250, function () { intro.classList.add('s3'); });
    at(2150, exit);
    at(5200, end);
    intro.addEventListener('click', exit);
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { exit(); document.removeEventListener('keydown', k); } });
  } else {
    if (intro) intro.remove();
    go();
  }

  /* ---------- header, phone bar ---------- */
  var hdr = $('.hdr'), bar = $('.bar'), home = document.body.classList.contains('page-home');
  var onScroll = function () {
    var y = window.scrollY || 0;
    if (hdr && home) hdr.classList.toggle('solid', y > 40);
    if (bar) bar.classList.toggle('show', y > (home ? window.innerHeight * 0.6 : 240));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- phone menu ---------- */
  var menu = $('.menu'), burger = $('.burger');
  if (menu && burger) {
    var open = function (v) {
      menu.classList.toggle('open', v);
      menu.setAttribute('aria-hidden', v ? 'false' : 'true');
      burger.setAttribute('aria-expanded', v ? 'true' : 'false');
      document.body.style.overflow = v ? 'hidden' : '';
      if (v) setTimeout(function () { var f = $('.x', menu); f && f.focus(); }, 50); else burger.focus();
    };
    burger.addEventListener('click', function () { open(true); });
    $('.x', menu).addEventListener('click', function () { open(false); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('open'); document.body.style.overflow = ''; }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) open(false); });
  }

  /* ---------- reveal on scroll ---------- */
  var rvs = $$('.rv');
  if (motion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rvs.forEach(function (n) { io.observe(n); });
    /* backup: anything on screen shows even if the observer is slow or paused */
    var sweepIn = function () { rvs.forEach(function (n) { if (n.classList.contains('in')) return; var r = n.getBoundingClientRect(); if (r.top < window.innerHeight && r.bottom > 0) n.classList.add('in'); }); };
    setTimeout(sweepIn, 1600);
    window.addEventListener('scroll', function () { clearTimeout(sweepIn._t); sweepIn._t = setTimeout(sweepIn, 250); }, { passive: true });
  } else rvs.forEach(function (n) { n.classList.add('in'); });

  var maps = $$('.mapbox');
  if (maps.length) {
    var mapIn = function () { maps.forEach(function (m) { var r = m.getBoundingClientRect(); if (r.top < window.innerHeight * 0.8 && r.bottom > 0) m.classList.add('in'); }); };
    window.addEventListener('scroll', function () { clearTimeout(mapIn._t); mapIn._t = setTimeout(mapIn, 150); }, { passive: true });
    setTimeout(mapIn, 800);
  }

  /* ---------- hero video ---------- */
  var vid = $('.hero video');
  if (vid) {
    var small = window.matchMedia('(max-width: 760px)').matches;
    var save = navigator.connection && navigator.connection.saveData;
    var vbtn = $('.hero .vbtn');
    if (!motion || save) {
      vid.removeAttribute('autoplay');
      if (vbtn) vbtn.hidden = true;
    } else {
      vid.src = small ? vid.getAttribute('data-sm') : vid.getAttribute('data-lg');
      vid.muted = true;
      var tryPlay = function () { var p = vid.play(); if (p && p.catch) p.catch(function () {}); };
      tryPlay();
      document.addEventListener('visibilitychange', function () { if (!document.hidden && !vid.dataset.paused) tryPlay(); });
      if (vbtn) vbtn.addEventListener('click', function () {
        if (vid.paused) { vid.dataset.paused = ''; delete vid.dataset.paused; tryPlay(); vbtn.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-pause"/></svg>'; vbtn.setAttribute('aria-label', 'Pause the background video'); }
        else { vid.pause(); vid.dataset.paused = '1'; vbtn.innerHTML = '<svg class="ico" aria-hidden="true"><use href="#i-play"/></svg>'; vbtn.setAttribute('aria-label', 'Play the background video'); }
      });
    }
  }

  /* ---------- before / after sliders ---------- */
  $$('.cmp').forEach(function (c) {
    var grip = $('.grip', c), lbB = $('.lb.b', c), lbA = $('.lb.a', c);
    var set = function (p) {
      p = clamp(p, 0, 100);
      c.style.setProperty('--pos', p + '%');
      if (grip) grip.setAttribute('aria-valuenow', Math.round(p));
      if (lbB) lbB.style.opacity = p < 14 ? 0 : 1;
      if (lbA) lbA.style.opacity = p > 86 ? 0 : 1;
      c._p = p;
    };
    c._set = set;
    set(parseFloat(c.getAttribute('data-start') || '50'));
    var drag = false;
    var move = function (x) { var r = c.getBoundingClientRect(); set((x - r.left) / r.width * 100); c._manual = true; };
    c.addEventListener('pointerdown', function (e) { drag = true; c.setPointerCapture && c.setPointerCapture(e.pointerId); move(e.clientX); });
    c.addEventListener('pointermove', function (e) { if (drag) move(e.clientX); });
    var stop = function () { drag = false; };
    c.addEventListener('pointerup', stop); c.addEventListener('pointercancel', stop);
    if (grip) grip.addEventListener('keydown', function (e) {
      var k = e.key, p = c._p;
      if (k === 'ArrowLeft' || k === 'ArrowDown') p -= 5; else if (k === 'ArrowRight' || k === 'ArrowUp') p += 5; else if (k === 'Home') p = 0; else if (k === 'End') p = 100; else return;
      e.preventDefault(); c._manual = true; set(p);
    });
  });

  /* ---------- scroll-driven pieces ---------- */
  var scrubs = [];
  var ba = $('.ba-sec');
  var wide = window.matchMedia('(min-width: 861px)');

  /* a slider that isn't scroll-driven sweeps from before to after once, the first time it is seen */
  var sweep = function (c) {
    if (c._manual || c._swept) return;
    c._swept = true;
    var t0 = Date.now(), dur = 2600;
    var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    var frame = function () {
      if (c._manual) return;
      var t = clamp((Date.now() - t0) / dur, 0, 1), p;
      if (t < .62) p = 92 - ease(t / .62) * 84; else p = 8 + ease((t - .62) / .38) * 42;
      c._set(p);
      if (t < 1) setTimeout(frame, 16);
    };
    frame();
  };
  if (motion) {
    var cmps = $$('.cmp');
    cmps.forEach(function (c) { if (!(ba && ba.contains(c) && wide.matches)) c._set(92); });
    var checkCmp = function () {
      cmps.forEach(function (c) {
        if (c._swept || c._manual) return;
        if (ba && ba.contains(c) && wide.matches) return;
        var r = c.getBoundingClientRect(), vh = window.innerHeight;
        if (r.top < vh * 0.7 && r.bottom > vh * 0.3) { c._swept = 'wait'; setTimeout(function () { c._swept = false; sweep(c); }, 350); }
      });
    };
    window.addEventListener('scroll', function () { clearTimeout(checkCmp._t); checkCmp._t = setTimeout(checkCmp, 120); }, { passive: true });
    setTimeout(checkCmp, 600);
  }
  if (ba && motion) {
    var bc = $('.cmp', ba), bp = $('.ba-prog', ba);
    scrubs.push(function () {
      if (!wide.matches || !bc || bc._manual) return;
      var r = ba.getBoundingClientRect(), span = r.height - window.innerHeight;
      var p = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
      var e = p < .12 ? 0 : p > .88 ? 1 : (p - .12) / .76;
      bc._set(96 - e * 92);
      if (bp) bp.style.setProperty('--p', e.toFixed(3));
    });
  } else if (ba) root.classList.add('no-scrub');

  var story = $('.story');
  if (story && motion) {
    var track = $('.track', story), cnt = $('.counter .bar2', story), num = $('.counter .now', story);
    var pinOK = window.matchMedia('(min-width: 900px)');
    var dist = 0;
    var size = function () {
      if (!pinOK.matches) { story.classList.remove('pinned'); story.style.removeProperty('--h'); track.style.transform = ''; return; }
      story.classList.add('pinned');
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      story.style.setProperty('--h', (window.innerHeight + dist) + 'px');
    };
    size();
    window.addEventListener('resize', size);
    $$('img', track).forEach(function (im) { if (!im.complete) im.addEventListener('load', size); });
    var panels = $$('.panel', track);
    scrubs.push(function () {
      if (!story.classList.contains('pinned')) {
        if (cnt) { var sl = track.scrollLeft, mx = track.scrollWidth - track.clientWidth; cnt.style.setProperty('--p', mx > 0 ? (sl / mx).toFixed(3) : 0); }
        return;
      }
      var r = story.getBoundingClientRect();
      var p = dist > 0 ? clamp(-r.top / dist, 0, 1) : 0;
      track.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
      if (cnt) cnt.style.setProperty('--p', p.toFixed(3));
      if (num) num.textContent = String(Math.min(panels.length, 1 + Math.floor(p * panels.length * 0.999)));
    });
    track.addEventListener('scroll', function () { scrubs.forEach(function (f) { f(); }); }, { passive: true });
  }

  if (scrubs.length) {
    var ticking = false;
    var run = function () { if (!ticking) return; ticking = false; scrubs.forEach(function (f) { f(); }); };
    /* animation frame when the page is painting, a short timer as a backup */
    var req = function () { if (!ticking) { ticking = true; raf(run); setTimeout(run, 60); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    ticking = true; run();
  }

  /* ---------- services list with a sticky photo ---------- */
  var list = $('.svc-list'), media = $('.svc-media');
  if (list && media) {
    var items = $$('.svc-item', list), figs = $$('figure', media), curSvc = -1;
    list.classList.add('live');
    var activate = function (i) {
      if (i === curSvc) return; curSvc = i;
      items.forEach(function (n, k) { n.classList.toggle('on', k === i); });
      figs.forEach(function (n, k) { n.classList.toggle('on', k === i); });
    };
    activate(0);
    /* the item nearest the middle of the screen is the active one */
    var pick = function () {
      var mid = window.innerHeight / 2, best = 0, bd = Infinity;
      items.forEach(function (n, k) { var r = n.getBoundingClientRect(), d = Math.abs((r.top + r.bottom) / 2 - mid); if (d < bd) { bd = d; best = k; } });
      activate(best);
    };
    window.addEventListener('scroll', function () { clearTimeout(pick._t); pick._t = setTimeout(pick, 60); }, { passive: true });
    items.forEach(function (n, i) { n.addEventListener('mouseenter', function () { activate(i); }); });
  }

  /* ---------- step forms (quick quote and contact) ---------- */
  $$('form[data-steps]').forEach(function (f) {
    var steps = $$('.step', f), bars = $$('.prog i', f), count = $('.count', f), done = $('.done', f);
    var i = 0;
    var show = function (n) {
      i = n;
      steps.forEach(function (s, k) { s.hidden = k !== n; });
      bars.forEach(function (b, k) { b.classList.toggle('on', k <= n); });
      if (count) count.textContent = 'Step ' + (n + 1) + ' of ' + steps.length;
    };
    var valid = function (s) {
      var ok = true;
      $$('[data-need]', s).forEach(function (fl) {
        var inp = $('input,textarea,select', fl), v = inp ? inp.value.trim() : '';
        var good = v.length > 0;
        if (inp && inp.type === 'tel') good = v.replace(/\D/g, '').length >= 8;
        fl.classList.toggle('bad', !good);
        if (!good && ok) { inp.focus(); ok = false; }
      });
      var group = $('[data-pick]', s);
      if (group) {
        var any = $$('input:checked', group).length > 0, er = $('.pick-err', s);
        if (er) er.hidden = any;
        if (!any) ok = false;
      }
      return ok;
    };
    $$('[data-next]', f).forEach(function (b) { b.addEventListener('click', function () { if (valid(steps[i])) { show(i + 1); var fx = $('input:not([type=checkbox]):not([type=radio]),textarea', steps[i]); if (fx && window.innerWidth > 760) fx.focus(); } }); });
    $$('[data-back]', f).forEach(function (b) { b.addEventListener('click', function () { show(i - 1); }); });
    $$('input', f).forEach(function (inp) { inp.addEventListener('input', function () { var fl = inp.closest('[data-need]'); if (fl) fl.classList.remove('bad'); }); });
    $$('[data-pick] input', f).forEach(function (inp) { inp.addEventListener('change', function () { var er = $('.pick-err', f); if (er) er.hidden = true; }); });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!valid(steps[i])) return;
      var nm = $('[name=name]', f), first = nm && nm.value.trim().split(/\s+/)[0];
      steps.forEach(function (s) { s.hidden = true; });
      $$('.prog,.head .count', f).forEach(function (n) { n.hidden = true; });
      $$('.fine', f).forEach(function (n) { n.hidden = true; });
      if (done) {
        var sp = $('[data-name]', done); if (sp) sp.textContent = first ? ', ' + first : '';
        done.hidden = false; done.focus();
      }
    });
    var again = done && $('[data-again]', done);
    if (again) again.addEventListener('click', function () { f.reset(); done.hidden = true; $$('.prog,.head .count', f).forEach(function (n) { n.hidden = false; }); $$('.fine', f).forEach(function (n) { n.hidden = false; }); show(0); });
    show(0);
  });

  /* contact page: ?service=gutters ticks that job */
  var qs = (location.search.match(/[?&]service=([a-z-]+)/) || [])[1];
  if (qs) { var box = $('form [value="' + qs + '"]'); if (box) box.checked = true; }

  /* file field shows how many photos were picked */
  $$('.drop input[type=file]').forEach(function (inp) {
    inp.addEventListener('change', function () { var t = $('.drop-t', inp.closest('.drop')); if (t) t.textContent = inp.files.length ? inp.files.length + (inp.files.length === 1 ? ' photo added' : ' photos added') : 'Add photos of the job'; });
  });

  /* ---------- gallery filter and viewer ---------- */
  var gal = $('.gal');
  if (gal) {
    var tiles = $$('.g', gal);
    $$('.filters button').forEach(function (b) {
      b.addEventListener('click', function () {
        var cat = b.getAttribute('data-f');
        $$('.filters button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        tiles.forEach(function (t) {
          var show = cat === 'all' || (t.getAttribute('data-c') || '').split(' ').indexOf(cat) > -1;
          t.classList.toggle('hide', !show);
          if (show) { t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); }
        });
      });
    });
    var lb = $('.lbx'), lbImg = $('img', lb), lbCap = $('figcaption', lb), cur = 0, last = null;
    var vis = function () { return tiles.filter(function (t) { return !t.classList.contains('hide'); }); };
    var open = function (t) {
      var v = vis(); cur = v.indexOf(t); var im = $('img', t);
      lbImg.src = im.getAttribute('src'); lbImg.alt = im.alt; lbCap.textContent = t.getAttribute('data-cap') || im.alt;
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; $('.x', lb).focus();
    };
    var step = function (d) { var v = vis(); cur = (cur + d + v.length) % v.length; var t = v[cur], im = $('img', t); lbImg.src = im.getAttribute('src'); lbImg.alt = im.alt; lbCap.textContent = t.getAttribute('data-cap') || im.alt; };
    var close = function () { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (last) last.focus(); };
    tiles.forEach(function (t) { t.addEventListener('click', function () { last = t; open(t); }); });
    $('.x', lb).addEventListener('click', close);
    $('.pv', lb).addEventListener('click', function () { step(-1); });
    $('.nx', lb).addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1); sx = null; });
  }

  /* ---------- services page: highlight the section in view ---------- */
  var jump = $('.jump');
  if (jump && 'IntersectionObserver' in window) {
    var links = $$('a', jump);
    var jo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + e.target.id;
          a.classList.toggle('on', on);
          if (on && jump.scrollWidth > jump.clientWidth) jump.scrollTo({ left: a.offsetLeft - 16, behavior: 'smooth' });
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(function (a) { var t = $(a.getAttribute('href')); if (t) jo.observe(t); });
  }
})();
