/* ============================================================
   John Miles Gonzaga — Portfolio
   Nav drawer · scrollspy · scroll reveal · gallery lightbox
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  var scrim = document.getElementById('navScrim');
  var links = Array.prototype.slice.call(menu.querySelectorAll('a[href^="#"]'));

  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    scrim.hidden = false;
    requestAnimationFrame(function () { scrim.classList.add('is-visible'); });
    document.body.classList.add('is-locked');
  }

  function closeMenu() {
    if (!menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    scrim.classList.remove('is-visible');
    document.body.classList.remove('is-locked');
    window.setTimeout(function () {
      if (!menu.classList.contains('is-open')) scrim.hidden = true;
    }, 300);
  }

  toggle.addEventListener('click', function () {
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  scrim.addEventListener('click', closeMenu);
  links.forEach(function (a) { a.addEventListener('click', closeMenu); });

  // Reset drawer state when resizing up to the desktop layout.
  var desktop = window.matchMedia('(min-width: 900px)');
  (desktop.addEventListener ? desktop.addEventListener.bind(desktop, 'change')
                            : desktop.addListener.bind(desktop))(function (e) {
    if (e.matches) closeMenu();
  });

  /* ---------- Nav shadow on scroll ---------- */
  function onScroll() {
    nav.classList.toggle('is-stuck', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Scrollspy ---------- */
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var visible = new Map();
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
        else visible.delete(entry.target.id);
      });
      var best = null;
      visible.forEach(function (ratio, id) {
        if (!best || ratio > best.ratio) best = { id: id, ratio: ratio };
      });
      if (best) setActive(best.id);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbStage = document.getElementById('lbStage');
  var lbCaption = document.getElementById('lbCaption');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var cells = Array.prototype.slice.call(document.querySelectorAll('.gallery__cell'));
  var allItems = cells.map(function (cell) { return cell.querySelector('.gallery__item'); });
  var items = allItems.slice();   // the currently visible set — filters narrow this
  var index = 0;
  var lastFocused = null;

  /* Category filters */
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var filterCount = document.getElementById('filterCount');

  function applyFilter(category, immediate) {
    cells.forEach(function (cell) {
      cell.hidden = category !== 'all' && cell.dataset.category !== category;
    });
    items = cells.filter(function (c) { return !c.hidden; })
                 .map(function (c) { return c.querySelector('.gallery__item'); });

    filterButtons.forEach(function (b) {
      var on = b.dataset.filter === category;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    filterCount.textContent = items.length + (items.length === 1 ? ' item' : ' items') +
      (category === 'all' ? '' : ' in this category');

    // After a filter click, tiles must appear at once — the reveal observer
    // would otherwise leave a re-shown tile faded out until the next scroll.
    if (immediate) {
      cells.forEach(function (cell) {
        if (!cell.hidden) cell.classList.add('is-visible');
      });
    }
  }

  filterButtons.forEach(function (b) {
    b.addEventListener('click', function () { applyFilter(b.dataset.filter, true); });
  });
  if (filterButtons.length) applyFilter('all', false);

  /* ---------- Video sound ----------
     Volume and mute persist between clips, so a visitor sets them once. iOS
     ignores the volume property (hardware buttons own it there), but honours
     muted — hence a mute button next to the slider rather than a slider alone. */
  var VOL_KEY = 'jm-volume';
  var MUTE_KEY = 'jm-muted';

  function loadVolume() {
    var level = 1, muted = false;
    try {
      var stored = window.localStorage.getItem(VOL_KEY);
      if (stored !== null && !isNaN(parseFloat(stored))) level = Math.min(1, Math.max(0, parseFloat(stored)));
      muted = window.localStorage.getItem(MUTE_KEY) === '1';
    } catch (e) { /* storage blocked — fall back to defaults */ }
    return { level: level, muted: muted };
  }

  function saveVolume(level, muted) {
    try {
      window.localStorage.setItem(VOL_KEY, String(level));
      window.localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
    } catch (e) { /* storage blocked — session-only volume */ }
  }

  function applyVolume(video, state) {
    video.volume = state.level;
    video.muted = state.muted || state.level === 0;
  }

  var SPEAKER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z" fill="currentColor"/>' +
                '<path class="wave wave--1" d="M15.4 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
                '<path class="wave wave--2" d="M17.9 6.7a7.5 7.5 0 0 1 0 10.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
                '<path class="cross" d="m16 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

  function buildVolume(video) {
    var bar = document.createElement('div');
    bar.className = 'volume';

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'volume__btn';
    toggle.innerHTML = SPEAKER;

    var slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'volume__slider';
    slider.min = '0';
    slider.max = '100';
    slider.step = '1';
    slider.setAttribute('aria-label', 'Volume');

    var label = document.createElement('span');
    label.className = 'volume__value';

    function sync() {
      var pct = Math.round(video.volume * 100);
      var off = video.muted || pct === 0;
      slider.value = String(off ? 0 : pct);
      slider.setAttribute('aria-valuetext', off ? 'Muted' : pct + ' percent');
      label.textContent = off ? 'Muted' : pct + '%';
      bar.classList.toggle('is-muted', off);
      toggle.setAttribute('aria-pressed', off ? 'true' : 'false');
      toggle.setAttribute('aria-label', off ? 'Unmute video' : 'Mute video');
      bar.style.setProperty('--fill', (off ? 0 : pct) + '%');
    }

    toggle.addEventListener('click', function () {
      if (video.muted || video.volume === 0) {
        video.muted = false;
        if (video.volume === 0) video.volume = 0.6;
      } else {
        video.muted = true;
      }
      saveVolume(video.volume, video.muted);
      sync();
    });

    slider.addEventListener('input', function () {
      var level = Number(slider.value) / 100;
      video.volume = level;
      video.muted = level === 0;
      saveVolume(level, video.muted);
      sync();
    });

    // Keeps the bar honest when the browser's own controls change the level.
    video.addEventListener('volumechange', sync);

    bar.appendChild(toggle);
    bar.appendChild(slider);
    bar.appendChild(label);
    sync();
    return bar;
  }

  function startPlayback(video) {
    var attempt = video.play();
    if (!attempt || !attempt.catch) return;
    attempt.catch(function () {
      // Browsers block autoplay with sound until a page has been interacted
      // with. Fall back to a muted start rather than no playback at all — the
      // volume button then reads "Unmute".
      video.muted = true;
      var retry = video.play();
      if (retry && retry.catch) retry.catch(function () { /* user can press play */ });
    });
  }

  function currentVideo() { return lbStage.querySelector('video'); }

  /* Media rendering — image, self-hosted video, or YouTube embed */
  function renderMedia(btn) {
    var type = btn.dataset.type || 'image';
    lbStage.innerHTML = '';   // also stops any playing media

    if (type === 'video') {
      var src = btn.dataset.src || '';
      var video = document.createElement('video');
      video.src = src;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      // Full-size poster when one is given, else reuse the grid thumbnail.
      video.setAttribute('poster', btn.dataset.poster || btn.querySelector('img').src);
      video.addEventListener('error', function () {
        lbStage.innerHTML = '<div class="lightbox__missing">This video has not been added yet.' +
          '<br>Save the file as <code>' + src + '</code> and it will play here.</div>';
      });

      var player = document.createElement('div');
      player.className = 'player';
      player.appendChild(video);
      player.appendChild(buildVolume(video));
      lbStage.appendChild(player);

      applyVolume(video, loadVolume());
      startPlayback(video);
      return;
    }

    if (type === 'youtube') {
      var id = (btn.dataset.id || '').trim();
      if (!id) {
        lbStage.innerHTML = '<div class="lightbox__missing">No YouTube video linked yet.' +
          '<br>Add the video id to <code>data-id</code> on this tile in <code>index.html</code>.</div>';
        return;
      }
      var box = document.createElement('div');
      box.className = 'embed';
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      frame.title = btn.dataset.caption || 'Video';
      frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture';
      frame.setAttribute('allowfullscreen', '');
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      box.appendChild(frame);
      lbStage.appendChild(box);
      return;
    }

    var thumb = btn.querySelector('img');
    var full = document.createElement('img');
    full.src = btn.dataset.full || thumb.src;
    full.alt = thumb.alt;
    lbStage.appendChild(full);
  }

  function show(i) {
    index = (i + items.length) % items.length;
    var btn = items[index];
    renderMedia(btn);
    lbCaption.textContent = btn.dataset.caption || '';
  }

  function openLightbox(btn) {
    lastFocused = btn;   // the trigger, so focus returns there on close
    show(items.indexOf(btn));
    lightbox.hidden = false;
    requestAnimationFrame(function () { lightbox.classList.add('is-open'); });
    document.body.classList.add('is-locked');
    lbClose.focus();
    // A single item has nothing to page through.
    lbPrev.hidden = lbNext.hidden = items.length < 2;
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    lbStage.innerHTML = '';   // stop playback immediately, not after the fade
    window.setTimeout(function () { lightbox.hidden = true; }, 250);
    if (lastFocused) lastFocused.focus();
  }

  allItems.forEach(function (btn) {
    btn.addEventListener('click', function () { openLightbox(btn); });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function () { show(index - 1); });
  lbNext.addEventListener('click', function () { show(index + 1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();   // click the backdrop to dismiss
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (!lightbox.hidden) closeLightbox();
      else closeMenu();
      return;
    }
    if (lightbox.hidden) return;

    var video = currentVideo();

    // Volume from the keyboard, unless the slider itself has focus (arrows
    // already drive a range input) or the native controls do.
    // `classList` is missing on non-element targets such as document.
    var onSlider = e.target && e.target.classList &&
                   e.target.classList.contains('volume__slider');
    if (video && e.target !== video && !onSlider) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        var step = e.key === 'ArrowUp' ? 0.05 : -0.05;
        video.volume = Math.min(1, Math.max(0, video.volume + step));
        video.muted = video.volume === 0;
        saveVolume(video.volume, video.muted);
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        video.muted = !video.muted;
        if (!video.muted && video.volume === 0) video.volume = 0.6;
        saveVolume(video.volume, video.muted);
        return;
      }
    }

    // Inside a video, the arrow keys belong to the player (seek / volume).
    var inPlayer = e.target && e.target.tagName === 'VIDEO';
    if (!inPlayer && items.length > 1) {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    }

    // Keep tab focus inside the dialog while it is open.
    if (e.key === 'Tab') {
      var focusables = [lbClose];
      var media = Array.prototype.slice.call(
        lbStage.querySelectorAll('video, iframe, .volume__btn, .volume__slider'));
      focusables = focusables.concat(media);
      if (!lbPrev.hidden) focusables.push(lbPrev, lbNext);
      var pos = focusables.indexOf(document.activeElement);
      var next = e.shiftKey ? pos - 1 : pos + 1;
      if (pos === -1 || next < 0 || next >= focusables.length) {
        e.preventDefault();
        focusables[e.shiftKey ? focusables.length - 1 : 0].focus();
      }
    }
  });
})();
