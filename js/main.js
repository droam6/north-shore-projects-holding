/* North Shore Projects. No libraries. Everything here is optional:
   without it the menus are plain links on phones, the panels and carousels still
   scroll, and the form shows the phone number instead. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 64rem)');

  /* ───────── Dropdown menus ───────── */

  var menus = Array.prototype.slice.call(document.querySelectorAll('[data-menu]'));
  var hoverable = window.matchMedia('(hover: hover) and (pointer: fine)');

  function setMenu(item, open) {
    item.classList.toggle('is-open', open);
    item.querySelector('.nav-btn').setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function closeMenus(except) {
    menus.forEach(function (m) { if (m !== except) setMenu(m, false); });
  }

  menus.forEach(function (item) {
    var btn = item.querySelector('.nav-btn');
    var timer;
    btn.addEventListener('click', function (e) {
      var open = !item.classList.contains('is-open');
      // With a mouse the menu is already open from hovering, so a click must not shut it.
      // (e.detail is 0 for a keyboard press, which still toggles.)
      if (!open && hoverable.matches && e.detail > 0) return;
      closeMenus(item);
      setMenu(item, open);
    });
    item.addEventListener('mouseenter', function () {
      if (!hoverable.matches) return;
      clearTimeout(timer);
      closeMenus(item);
      setMenu(item, true);
    });
    item.addEventListener('mouseleave', function () {
      if (!hoverable.matches) return;
      timer = setTimeout(function () { setMenu(item, false); }, 160);
    });
    item.addEventListener('focusout', function (e) {
      if (!item.contains(e.relatedTarget)) setMenu(item, false);
    });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && item.classList.contains('is-open')) {
        setMenu(item, false);
        btn.focus();
      }
    });
  });
  document.addEventListener('click', function (e) {
    menus.forEach(function (m) { if (!m.contains(e.target)) setMenu(m, false); });
  });

  /* ───────── Phone menu ───────── */

  var toggle = document.querySelector('[data-nav-toggle]');
  var mnav = document.getElementById('mnav');
  var main = document.getElementById('main');
  var footer = document.querySelector('.site-footer');

  function setNav(open) {
    if (!toggle || !mnav) return;
    mnav.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.querySelector('[data-nav-toggle-text]').textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('nav-open', open);
    [main, footer].forEach(function (el) { if (el) { if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } });
  }
  if (toggle && mnav) {
    toggle.addEventListener('click', function () { setNav(mnav.hidden); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !mnav.hidden) { setNav(false); toggle.focus(); }
    });
    mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
    window.matchMedia('(min-width: 64rem)').addEventListener('change', function (e) { if (e.matches) setNav(false); });
  }

  /* ───────── Hero panels ───────── */

  var panelsEl = document.querySelector('[data-panels]');
  if (panelsEl) {
    var panels = Array.prototype.slice.call(panelsEl.querySelectorAll('[data-panel]'));
    var pauseBtn = document.querySelector('[data-panels-pause]');
    var DWELL = 6000;
    var current = 0;
    var stopped = reduced;   // the visitor pressed pause (or asked for less motion)
    var held = false;        // pointer or focus is on the panels
    var visible = true;
    var tick = null;
    var startedAt = 0;
    var remaining = DWELL;

    panelsEl.style.setProperty('--dwell', DWELL / 1000 + 's');

    var activate = function (i) {
      current = (i + panels.length) % panels.length;
      panels.forEach(function (p, n) { p.classList.toggle('is-active', n === current); });
      remaining = DWELL;
      // restart the gold progress line
      panelsEl.classList.remove('is-running');
      void panelsEl.offsetWidth;
      schedule();
    };
    var schedule = function () {
      clearTimeout(tick);
      var run = wide.matches && !stopped && visible;
      panelsEl.classList.toggle('is-running', run);
      panelsEl.classList.toggle('is-held', run && held);
      if (!run || held) return;
      startedAt = Date.now();
      tick = setTimeout(function () { activate(current + 1); }, remaining);
    };
    var hold = function (on) {
      if (on === held) return;
      if (on && tick) remaining = Math.max(600, remaining - (Date.now() - startedAt));
      held = on;
      schedule();
    };

    panels.forEach(function (p, i) {
      p.addEventListener('mouseenter', function () { if (wide.matches && i !== current) { activate(i); } });
      p.addEventListener('focusin', function () { if (wide.matches && i !== current) activate(i); });
    });
    panelsEl.addEventListener('mouseenter', function () { hold(true); });
    panelsEl.addEventListener('mouseleave', function () { hold(false); });
    panelsEl.addEventListener('focusin', function () { hold(true); });
    panelsEl.addEventListener('focusout', function (e) { if (!panelsEl.contains(e.relatedTarget)) hold(false); });

    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        stopped = !stopped;
        pauseBtn.setAttribute('aria-pressed', stopped ? 'true' : 'false');
        pauseBtn.querySelector('[data-panels-pause-text]').textContent = stopped ? 'Play' : 'Pause';
        remaining = DWELL;
        panelsEl.classList.remove('is-running');
        void panelsEl.offsetWidth;
        schedule();
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        schedule();
      }, { threshold: 0.25 }).observe(panelsEl);
    }
    document.addEventListener('visibilitychange', function () { visible = !document.hidden; schedule(); });
    wide.addEventListener('change', schedule);
    schedule();
  }

  /* ───────── Carousels ───────── */

  Array.prototype.forEach.call(document.querySelectorAll('[data-carousel]'), function (root) {
    var track = root.querySelector('[data-track]');
    var slides = Array.prototype.slice.call(track.children);
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    var count = root.querySelector('[data-count]');
    var behavior = reduced ? 'auto' : 'smooth';

    // Left inset of the first slide. Read from layout, not from the CSS value, because the
    // padding is a max()/calc() expression that does not parse to a number.
    var pad = function () { return slides[0].offsetLeft - track.offsetLeft; };
    var index = function () {
      var x = track.scrollLeft + pad() + 2;
      var best = 0;
      slides.forEach(function (s, i) { if (s.offsetLeft <= x) best = i; });
      // at the far end the last slides can never reach the left edge
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) best = Math.max(best, slides.length - 1);
      return best;
    };
    var go = function (i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[i].offsetLeft - pad(), behavior: behavior });
    };
    var update = function () {
      var i = index();
      if (count) count.textContent = String(i + 1);
      var atStart = track.scrollLeft <= 2;
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      if (prev) prev.disabled = atStart;
      if (next) next.disabled = atEnd;
    };
    var firstFullyRight = function () {
      var x = track.scrollLeft + pad() + 2;
      for (var i = 0; i < slides.length; i++) if (slides[i].offsetLeft > x) return i;
      return slides.length - 1;
    };
    var firstLeft = function () {
      var x = track.scrollLeft + pad() - 2;
      for (var i = slides.length - 1; i >= 0; i--) if (slides[i].offsetLeft < x) return i;
      return 0;
    };
    if (prev) prev.addEventListener('click', function () { go(firstLeft()); });
    if (next) next.addEventListener('click', function () { go(firstFullyRight()); });
    var raf;
    track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ───────── Clips: one plays at a time, always muted ───────── */

  var reelBtns = Array.prototype.slice.call(document.querySelectorAll('[data-reel]'));
  function stopReel(btn) {
    var v = btn.querySelector('video');
    v.pause();
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace(/^Pause/, 'Play'));
  }
  reelBtns.forEach(function (btn) {
    var v = btn.querySelector('video');
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-pressed') === 'true') { stopReel(btn); return; }
      reelBtns.forEach(function (b) { if (b !== btn && b.getAttribute('aria-pressed') === 'true') stopReel(b); });
      v.muted = true;
      var p = v.play();
      btn.setAttribute('aria-pressed', 'true');
      btn.setAttribute('aria-label', btn.getAttribute('aria-label').replace(/^Play/, 'Pause'));
      if (p && p.catch) p.catch(function () { stopReel(btn); });
    });
  });
  if (reelBtns.length && 'IntersectionObserver' in window) {
    var reelWatch = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting && en.target.getAttribute('aria-pressed') === 'true') stopReel(en.target);
      });
    }, { threshold: 0.1 });
    reelBtns.forEach(function (b) { reelWatch.observe(b); });
  }

  /* ───────── Enquiry form ───────── */

  var ENDPOINTS = {
    tiling: 'https://formspree.io/f/xojkgngr',
    painting: 'https://formspree.io/f/xpqyvyae',
    cleaning: 'https://formspree.io/f/xreynygg',
    removals: 'https://formspree.io/f/mojkgkpn'
  };
  var TEAM_PHONE = {
    tiling: ['0433 333 332', '+61433333332'],
    painting: ['0433 333 332', '+61433333332'],
    cleaning: ['0433 333 332', '+61433333332'],
    removals: ['0451 488 266', '+61451488266']
  };
  var LEAD_WEBHOOK = 'https://droam8.app.n8n.cloud/webhook/lead-submission';

  function listWords(arr) {
    if (arr.length < 2) return arr.join('');
    return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-enquiry]'), function (form) {
    var status = form.querySelector('[data-status]');
    var submit = form.querySelector('[data-submit]');
    var done = form.parentElement.querySelector('[data-done]');
    var boxes = Array.prototype.slice.call(form.querySelectorAll('input[name="service"]'));
    var delivered = [];   // teams that already have this enquiry (kept across a retry)
    var logged = {};      // teams already written to the lead log

    // /contact?service=tiling ticks the box for you
    try {
      var want = new URLSearchParams(window.location.search).get('service');
      if (want) boxes.forEach(function (b) { if (b.value === want) b.checked = true; });
    } catch (e) {}

    function fieldOf(name) { return form.querySelector('[data-field="' + name + '"]'); }
    function setError(name, msg) {
      var wrap = fieldOf(name);
      if (!wrap) return;
      var err = wrap.querySelector('[data-error]');
      var input = wrap.querySelector('.input');
      if (err) { err.textContent = msg || ''; err.hidden = !msg; }
      if (input) {
        if (msg) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', err.id); }
        else { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
      }
    }

    var checks = {
      service: function () { return boxes.some(function (b) { return b.checked; }) ? '' : 'Pick at least one service.'; },
      name: function () { return form.elements.name.value.trim().length >= 2 ? '' : 'Enter your name.'; },
      phone: function () {
        var v = form.elements.phone.value.trim();
        if (!v) return 'Enter your phone number.';
        var digits = v.replace(/[^\d+]/g, '');
        return /^(\+?61|0)\d{9}$/.test(digits) ? '' : 'Enter an Australian phone number, like 0400 000 000.';
      },
      email: function () {
        var v = form.elements.email.value.trim();
        if (!v) return 'Enter your email address.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Check the email address. It needs an @ and a domain.';
      },
      message: function () {
        var v = form.elements.message.value.trim();
        if (!v) return 'Tell us what the job is.';
        return v.length >= 10 ? '' : 'Add a little more detail about the job.';
      }
    };

    Object.keys(checks).forEach(function (name) {
      var wrap = fieldOf(name);
      if (!wrap) return;
      wrap.addEventListener('change', function () { setError(name, checks[name]()); });
      wrap.addEventListener('input', function () {
        var err = wrap.querySelector('[data-error]');
        if (err && !err.hidden) setError(name, checks[name]());
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.hidden = true;

      var firstBad = null;
      Object.keys(checks).forEach(function (name) {
        var msg = checks[name]();
        setError(name, msg);
        if (msg && !firstBad) firstBad = name;
      });
      if (firstBad) {
        var target = fieldOf(firstBad).querySelector('.input, input');
        if (target) target.focus();
        return;
      }

      // Honeypot: a filled hidden field means a bot. Say nothing, send nothing.
      if (form.elements.website_url && form.elements.website_url.value) { finish([]); return; }

      var picked = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
      var base = {
        source: 'northshoreprojects',
        name: form.elements.name.value.trim(),
        phone: form.elements.phone.value.trim(),
        phone_raw: form.elements.phone.value.replace(/[^\d+]/g, ''),
        email: form.elements.email.value.trim().toLowerCase(),
        suburb: form.elements.suburb.value.trim(),
        message: form.elements.message.value.trim(),
        preferCallback: form.elements.preferCallback.checked ? 'Yes' : 'No',
        page: window.location.pathname
      };

      submit.disabled = true;
      var label = submit.textContent;
      submit.textContent = 'Sending';

      var jobs = picked.map(function (service) {
        var body = {};
        Object.keys(base).forEach(function (k) { body[k] = base[k]; });
        body.service = service;
        body.other_services = picked.filter(function (s) { return s !== service; }).join(', ');
        body._subject = 'New ' + service + ' enquiry from northshoreprojects.com.au';

        // Lead log. Fire and forget: it must never hold up or fail the enquiry itself.
        // Once per team, so a retry after a failed send does not log the lead twice.
        if (!logged[service]) {
          logged[service] = true;
          try {
            fetch(LEAD_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(function () {});
          } catch (err) {}
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'form_submission', service: service, source: base.source });
        }

        return fetch(ENDPOINTS[service], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body)
        }).then(function (res) { return { service: service, ok: res.ok }; })
          .catch(function () { return { service: service, ok: false }; });
      });

      Promise.all(jobs).then(function (results) {
        submit.disabled = false;
        submit.textContent = label;
        var failed = results.filter(function (r) { return !r.ok; }).map(function (r) { return r.service; });
        var sent = results.filter(function (r) { return r.ok; }).map(function (r) { return r.service; });
        sent.forEach(function (s) { if (delivered.indexOf(s) === -1) delivered.push(s); });
        if (!failed.length) { finish(delivered); return; }

        // Leave only the failed teams ticked so a retry does not send twice.
        boxes.forEach(function (b) { b.checked = failed.indexOf(b.value) !== -1; });
        var phones = [];
        failed.forEach(function (s) {
          var p = TEAM_PHONE[s];
          if (!phones.some(function (x) { return x[0] === p[0]; })) phones.push(p);
        });
        status.textContent = '';
        var msg = (sent.length ? 'Sent to the ' + listWords(sent) + ' team' + (sent.length > 1 ? 's' : '') + ', but not ' : 'Your enquiry could not be sent ')
          + 'to the ' + listWords(failed) + ' team' + (failed.length > 1 ? 's' : '') + '. Try again, or call ';
        status.appendChild(document.createTextNode(msg));
        phones.forEach(function (p, i) {
          if (i) status.appendChild(document.createTextNode(' or '));
          var a = document.createElement('a');
          a.href = 'tel:' + p[1];
          a.textContent = p[0];
          status.appendChild(a);
        });
        status.appendChild(document.createTextNode('.'));
        status.hidden = false;
        status.focus();
      });
    });

    function finish(sent) {
      var text = sent.length
        ? 'It has gone to the ' + listWords(sent) + ' team' + (sent.length > 1 ? 's' : '') + '. They will reply by phone or email.'
        : 'Thank you.';
      done.querySelector('[data-done-text]').textContent = text;
      form.hidden = true;
      done.hidden = false;
      done.focus();
    }
  });
})();
