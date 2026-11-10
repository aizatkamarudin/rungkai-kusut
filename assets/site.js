/* =========================================================
   Rungkai Kusut — homepage interactions
   Libraries (self-hosted in /assets/vendor): GSAP + ScrollTrigger, Lenis
   Everything degrades gracefully: if a library fails to load or the
   visitor prefers reduced motion, content is simply shown.
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const gsap = window.gsap, ST = window.ScrollTrigger;
  const motion = !!(gsap && ST) && !reduce;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);

  $('#yr').textContent = new Date().getFullYear();

  /* tighten the wide side-bearing of . , ? ' in big display type */
  $$('.h2, .hero h1, .manifesto .big').forEach(el => {
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 1) return walk(c);
      if (c.nodeType !== 3 || !/[.,?']/.test(c.textContent)) return;
      const tmp = document.createElement('span');
      tmp.innerHTML = c.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/([.,?'])/g, '<span class="pn">$1</span>');
      c.replaceWith(...tmp.childNodes);
    });
    walk(el);
  });

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  if (motion) gsap.registerPlugin(ST);

  const scrollToEl = (el) => {
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------------- header + menu ---------------- */
  const hdr = $('#hdr');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-solid', y > 40);
    hdr.classList.toggle('is-hidden', y > 300 && y > lastY && !document.body.classList.contains('menu-open'));
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = $('#menuBtn');
  $$('#menu nav a').forEach((a, i) => a.querySelector('span').style.transitionDelay = (0.15 + i * 0.05) + 's');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  menuBtn.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // in-page anchors
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id === '#top' ? document.body : $(id);
    if (!el) return;
    e.preventDefault();
    setMenu(false);
    if (a.dataset.topic) { const sel = $('#f-topic'); if (sel) sel.value = a.dataset.topic; }
    id === '#top' ? (lenis ? lenis.scrollTo(0, { duration: 1.6 }) : scrollTo({ top: 0, behavior: 'smooth' })) : scrollToEl(el);
  }));

  /* ---------------- services accordion ---------------- */
  $$('.svc').forEach(s => {
    const b = $('.svc-btn', s);
    b.addEventListener('click', () => {
      const open = !s.classList.contains('open');
      $$('.svc.open').forEach(o => { if (o !== s) { o.classList.remove('open'); $('.svc-btn', o).setAttribute('aria-expanded', 'false'); } });
      s.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open);
      setTimeout(() => ST && ST.refresh(), 650);
    });
  });
  $$('.faq-list details').forEach(d => d.addEventListener('toggle', () => ST && setTimeout(() => ST.refresh(), 50)));

  /* ---------------- contact form (Web3Forms) ---------------- */
  const WEB3FORMS_KEY = 'df75ce75-fcca-4a46-b1af-33852c53a3ea';
  const form = $('#contactForm');
  const fbtn = $('button[type=submit]', form);
  const status = $('#formStatus');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(form);
    if (f.get('botcheck')) return;
    status.className = 'form-status';
    if (!f.get('name') || !f.get('email') || !f.get('msg') || !/^\S+@\S+\.\S+$/.test(f.get('email'))) {
      status.textContent = 'Please fill in your name, a valid email and what’s tangled.';
      status.classList.add('err');
      return;
    }
    fbtn.disabled = true; fbtn.firstChild.textContent = 'Sending… ';
    status.textContent = '';
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[Rungkai Kusut] ${f.get('topic')} — ${f.get('name')}`,
          from_name: 'Rungkai Kusut website',
          replyto: f.get('email'),
          name: f.get('name'), organisation: f.get('org'), email: f.get('email'),
          topic: f.get('topic'), message: f.get('msg')
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      form.reset();
      status.textContent = 'Terima kasih! Your message is on its way. We’ll reply within one working day.';
      status.classList.add('ok');
    } catch (err) {
      status.innerHTML = 'Sorry, something went wrong. Please email us at <a href="mailto:hello@rungkaikusut.com">hello@rungkaikusut.com</a>.';
      status.classList.add('err');
    } finally {
      fbtn.disabled = false; fbtn.firstChild.textContent = 'Send message ';
    }
  });

  /* ---------------- footer wordmark ---------------- */
  const wm = $('#wordmark');
  wm.innerHTML = 'Rungkai Kusut'.split('').map(c => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('');

  /* =========================================================
     HERO THREADS — tangled lines that untangle as you scroll
     ========================================================= */
  const canvas = $('#threads');
  const ctx = canvas.getContext('2d');
  const hero = $('#hero');
  const T = { untangle: 0, reveal: motion ? 0 : 1, mx: -9999, my: -9999, visible: true, time: 0 };
  let W = 0, H = 0, DPR = 1, threads = [];
  const PTS = 90;

  function buildThreads() {
    const n = W < 700 ? 18 : 32;
    threads = [];
    for (let i = 0; i < n; i++) {
      const r = () => Math.random();
      threads.push({
        a1: 1 + Math.floor(r() * 3), a2: 2 + Math.floor(r() * 4),
        b1: 1 + Math.floor(r() * 3), b2: 2 + Math.floor(r() * 4),
        p1: r() * 6.28, p2: r() * 6.28, p3: r() * 6.28, p4: r() * 6.28,
        sp: 0.15 + r() * 0.25, i, n,
        hue: r()
      });
    }
  }
  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!threads.length || (threads[0].n === 18) !== (W < 700)) buildThreads();
  }

  const C_TANGLE = [228, 111, 146], C_CLEAN = [242, 181, 68];
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const u = T.untangle, t0 = T.time;
    const mobile = W < 700;
    const cx = mobile ? W * 0.55 : W * 0.66, cy = mobile ? H * 0.3 : H * 0.42;
    const rx = mobile ? W * 0.5 : Math.min(W * 0.3, 520), ry = mobile ? H * 0.2 : Math.min(H * 0.32, 300);
    const limit = Math.max(2, Math.floor(PTS * T.reveal));
    ctx.lineWidth = mobile ? 1 : 1.25;
    ctx.lineCap = 'round';
    for (const th of threads) {
      const k = th.i / (th.n - 1);
      // straight target: parallel lines rising gently to the right, like a clean trend
      const baseY = lerp(H * 0.16, H * 0.62, k);
      ctx.beginPath();
      for (let j = 0; j < limit; j++) {
        const s = j / (PTS - 1);
        const a = s * Math.PI * 2;
        const tx = cx + rx * (0.62 * Math.sin(th.a1 * a + th.p1 + t0 * th.sp) + 0.38 * Math.sin(th.a2 * a + th.p2 - t0 * th.sp * 0.7));
        const ty = cy + ry * (0.62 * Math.cos(th.b1 * a + th.p3 + t0 * th.sp * 0.8) + 0.38 * Math.sin(th.b2 * a + th.p4 + t0 * th.sp));
        const sx = lerp(-W * 0.04, W * 1.04, s);
        const sy = baseY - s * H * 0.1 + Math.sin(s * 6 + t0 + k * 3) * 2;
        // untangling sweeps from left to right: the "pulled" end straightens first
        const pk = smooth(clamp(u * 1.7 - (1 - s) * 0.7));
        let x = lerp(tx, sx, pk), y = lerp(ty, sy, pk);
        // cursor repels the tangle
        const dx = x - T.mx, dy = y - T.my, d2 = dx * dx + dy * dy;
        if (d2 < 22500) { const d = Math.sqrt(d2) || 1, f = (1 - d / 150) * 38; x += dx / d * f; y += dy / d * f; }
        j ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      const m = clamp(u * 1.3);
      const c = C_TANGLE.map((v, i) => Math.round(lerp(v, C_CLEAN[i], m)));
      const alpha = lerp(0.22, 0.5, m) + th.hue * 0.15;
      ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
      ctx.stroke();
      // end-point dots once clean
      if (m > 0.6 && T.reveal >= 1) {
        ctx.fillStyle = `rgba(242,181,68,${(m - 0.6) * 2.2})`;
        const ex = W * (mobile ? 0.9 : 0.93), es = (ex + W * 0.04) / (W * 1.08);
        const ey = baseY - es * H * 0.1;
        ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, Math.PI * 2); ctx.fill();
      }
    }
  }
  resize();
  addEventListener('resize', () => { resize(); if (!motion) draw(); });
  if (fine) {
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); T.mx = e.clientX - r.left; T.my = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { T.mx = T.my = -9999; });
  }
  new IntersectionObserver(([e]) => { T.visible = e.isIntersecting; }).observe(hero);

  if (!motion) {
    T.untangle = 0.35; draw();
  } else {
    gsap.ticker.add((time) => { if (!T.visible) return; T.time = time; draw(); });
  }

  // hero HUD (badge + strikethrough) driven by untangle value
  const strike = $('#strike'), ioWord = $('#ioWord'), ioPct = $('#ioPct'), badge = $('#badgeIO');
  function hud(u) {
    strike.style.setProperty('--strike', clamp(u * 2.2));
    ioPct.textContent = Math.round(u * 100);
    const clean = u > 0.5;
    if (badge.classList.contains('is-clean') !== clean) {
      badge.classList.toggle('is-clean', clean);
      ioWord.textContent = clean ? 'jelas' : 'kusut';
      $('#ioLbl').textContent = clean ? 'Output:' : 'Input:';
    }
  }

  if (!motion) { hud(0); finishLoader(); return; }

  /* =========================================================
     LOADER → HERO INTRO
     ========================================================= */
  function finishLoader() { window.__rkReady = true; const l = $('#loader'); if (l) l.remove(); }
  const loader = $('#loader');
  const seen = (() => { try { return sessionStorage.getItem('rk_seen'); } catch (e) { return null; } })();
  try { sessionStorage.setItem('rk_seen', '1'); } catch (e) {}
  const lp = $('#loaderPath');
  const len = lp.getTotalLength();
  gsap.set(lp, { strokeDasharray: len, strokeDashoffset: len });
  gsap.set('.hero h1 .line>span', { yPercent: 115 });
  gsap.set('[data-hero]', { y: 30, opacity: 0 });
  const counter = { v: 0 };
  const dur = seen ? 0.7 : 1.9;
  const tl = gsap.timeline({ paused: true });
  tl.to(lp, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }, 0)
    .to(counter, { v: 100, duration: dur, ease: 'power2.inOut', onUpdate: () => { $('#loaderNum').textContent = Math.round(counter.v); } }, 0)
    .to(lp, { attr: { d: 'M10 70 C 60 70, 110 70, 140 70 C 170 70, 190 70, 210 70 C 240 70, 260 70, 280 70 C 300 70, 320 70, 330 70 L 390 70' }, duration: 0.6, ease: 'expo.inOut' })
    .to(loader, { yPercent: -100, duration: 1.05, ease: 'expo.inOut', onComplete: finishLoader }, '+=0.1')
    .to(T, { reveal: 1, duration: 2.2, ease: 'power3.out' }, '-=0.6')
    .to('.hero h1 .line>span', { yPercent: 0, duration: 1.3, stagger: 0.1, ease: 'expo.out' }, '-=2.1')
    .to('[data-hero]', { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: 'expo.out' }, '-=1.1');
  (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(() => { tl.play(); ST.refresh(); });

  /* ---------------- hero scroll: untangle ---------------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    ST.create({
      trigger: hero, start: 'top top', end: '+=110%', pin: true, scrub: 0.6, refreshPriority: 3,
      onUpdate: s => { T.untangle = s.progress; hud(s.progress); }
    });
    gsap.to('.hero-in', { yPercent: -12, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '+=110%', scrub: true } });
  });
  mm.add('(max-width: 899px)', () => {
    ST.create({ trigger: hero, start: 'top top', end: 'bottom 20%', scrub: 0.6, onUpdate: s => { T.untangle = s.progress; hud(s.progress); } });
  });

  /* ---------------- marquees (velocity reactive) ---------------- */
  $$('[data-marquee]').forEach(track => {
    const unit = track.firstElementChild;
    const dir = +track.dataset.marquee;
    const fill = () => { while (track.scrollWidth < innerWidth * 2 + unit.offsetWidth) track.appendChild(unit.cloneNode(true)); };
    fill(); addEventListener('resize', fill);
    let x = 0, skew = 0;
    const setX = gsap.quickSetter(track, 'x', 'px'), setSkew = gsap.quickSetter(track, 'skewX', 'deg');
    gsap.ticker.add((_, dt) => {
      const v = lenis ? lenis.velocity : 0;
      const w = unit.offsetWidth;
      x -= (0.06 + Math.min(Math.abs(v) * 0.04, 1.2)) * dt * dir * (v < 0 ? -1 : 1);
      if (x <= -w) x += w; if (x > 0) x -= w;
      setX(x);
      skew = lerp(skew, clamp(v * -0.4, -8, 8), 0.1);
      setSkew(skew);
    });
  });

  /* ---------------- text splitting helpers ---------------- */
  function splitWords(el) {
    const walk = (node) => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return $$('.w', el);
  }
  function splitLines(el) {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map(l => `<span class="line"><span>${l.trim()}</span></span>`).join('');
    return $$('.line>span', el);
  }

  /* headline reveals */
  $$('.split-lines').forEach(el => {
    const lines = splitLines(el);
    gsap.from(lines, { yPercent: 115, duration: 1.2, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  /* manifesto word scrub */
  const man = $('#intro .split-words');
  gsap.to(splitWords(man), { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: man, start: 'top 80%', end: 'bottom 45%', scrub: true } });

  /* count-ups */
  $$('[data-count]').forEach(el => {
    const o = { v: 0 }, to = +el.dataset.count;
    gsap.to(o, { v: to, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => { el.textContent = Math.round(o.v); } });
  });
  gsap.from('.stat', { y: 60, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.stats', start: 'top 88%' } });

  /* generic reveal-up */
  ST.batch('.reveal-up', {
    start: 'top 90%',
    onEnter: b => gsap.fromTo(b, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.1, ease: 'expo.out', overwrite: true })
  });

  /* ---------------- process: horizontal pinned scroll ---------------- */
  mm.add('(min-width: 900px)', () => {
    const sec = $('#process'), hz = $('#hz');
    sec.classList.add('is-hz');
    const dist = () => hz.scrollWidth - innerWidth;
    const tw = gsap.to(hz, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1, refreshPriority: 2 }
    });
    gsap.to('#hzBar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), scrub: true } });
    $$('.step', hz).forEach(st => {
      gsap.from(st, { rotate: 6, y: 80, ease: 'none', scrollTrigger: { trigger: st, containerAnimation: tw, start: 'left 100%', end: 'left 55%', scrub: true } });
    });
    return () => sec.classList.remove('is-hz');
  });
  mm.add('(max-width: 899px)', () => {
    gsap.utils.toArray('.step').forEach(st => gsap.from(st, { y: 60, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: st, start: 'top 88%' } }));
  });

  /* ---------------- services rows stagger ---------------- */
  $$('.svc-group').forEach(g => gsap.from($$('.svc', g), { y: 40, opacity: 0, duration: 1, stagger: 0.07, ease: 'expo.out', scrollTrigger: { trigger: g, start: 'top 85%' } }));

  /* ---------------- digitalisation: strike + arrow ---------------- */
  $$('.dg').forEach(row => {
    const s = $('.from s', row), arrow = $('.arrow', row), to = $('.to', row);
    const tl2 = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 85%', end: 'top 45%', scrub: 0.6 } });
    tl2.fromTo(s, { '--p': 0 }, { '--p': 1, ease: 'none', duration: 1 })
       .fromTo(arrow, { scaleX: 0 }, { scaleX: 1, ease: 'none', duration: 0.6 }, 0.5)
       .fromTo(to, { x: -50, opacity: 0 }, { x: 0, opacity: 1, ease: 'none', duration: 0.8 }, 0.8);
  });

  /* ---------------- works: rows + floating preview ---------------- */
  gsap.from('.work', { y: 40, opacity: 0, duration: 0.9, stagger: 0.05, ease: 'expo.out', scrollTrigger: { trigger: '#workList', start: 'top 85%' } });
  const pv = $('#preview'), pvScr = $('#pvScr'), pvLabel = $('#pvLabel');
  const mock = {
    phone: c => `<div class="mk-phone"><div class="mk-bar" style="background:${c}"></div><div class="mk-row w80"></div><div class="mk-row w60"></div><div class="mk-card" style="border-color:${c}"><i style="background:${c}"></i><div class="mk-row w70"></div><div class="mk-row w40"></div></div><div class="mk-row w90"></div><div class="mk-btn" style="background:${c}"></div></div>`,
    iot: c => `<div class="mk-phone"><div class="mk-bar" style="background:${c}"></div><div class="mk-ring" style="--c:${c}"><b>72%</b></div><div class="mk-row w60"></div><div class="mk-row w80"></div><div class="mk-btn" style="background:${c}"></div></div>`,
    web: c => `<div class="mk-web"><div class="mk-top"><i></i><i></i><i></i></div><div class="mk-body"><div class="mk-side" style="background:${c}"></div><div class="mk-main"><div class="mk-row w60"></div><div class="mk-grid"><span></span><span></span><span></span></div><div class="mk-row w90"></div><div class="mk-row w70"></div></div></div></div>`,
    dash: c => `<div class="mk-web"><div class="mk-top"><i></i><i></i><i></i></div><div class="mk-body"><div class="mk-main"><div class="mk-kpis"><span style="background:${c}"></span><span></span><span></span></div><div class="mk-bars">${[40, 65, 50, 80, 58, 92, 70].map((h, i) => `<i style="height:${h}%;background:${i === 5 ? c : ''}"></i>`).join('')}</div></div></div></div>`
  };
  if (fine) {
    const qx = gsap.quickTo(pv, 'x', { duration: 0.6, ease: 'power3' });
    const qy = gsap.quickTo(pv, 'y', { duration: 0.6, ease: 'power3' });
    const list = $('#workList');
    list.addEventListener('pointermove', e => { qx(e.clientX + 30); qy(e.clientY - 120); });
    $$('.work', list).forEach(w => {
      w.addEventListener('pointerenter', (e) => {
        if (+gsap.getProperty(pv, 'opacity') < 0.05) gsap.set(pv, { x: e.clientX + 30, y: e.clientY - 120 });
        const c = w.dataset.c;
        pv.style.background = `radial-gradient(120% 100% at 30% 0%, ${c}, #0B1426 85%)`;
        pvScr.innerHTML = mock[w.dataset.k](c);
        pvLabel.textContent = $('.cat', w).textContent;
        gsap.to(pv, { opacity: 1, scale: 1, rotate: (Math.random() - 0.5) * 6, duration: 0.5, ease: 'expo.out' });
        cursorText($('.yr', w).textContent);
      });
      w.addEventListener('pointerleave', () => { gsap.to(pv, { opacity: 0, scale: 0.6, duration: 0.4, ease: 'power3.in' }); cursorText(null); });
    });
  }

  /* ---------------- free tools: gauge ---------------- */
  const gf = $('#gaugeFg');
  const g = { v: 0 };
  gsap.timeline({ scrollTrigger: { trigger: '#score', start: 'top 85%' } })
    .to(g, { v: 41, duration: 1.8, ease: 'power3.out', onUpdate: () => { $('#gaugeNum').textContent = Math.round(g.v); gf.style.strokeDashoffset = 408 * (1 - g.v / 100); } })
    .from('.issue', { x: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'expo.out' }, 0.3);
  gsap.from('.tool', { y: 70, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out', scrollTrigger: { trigger: '.tools-grid', start: 'top 85%' } });

  /* ---------------- quote: pin + word scrub + thread ---------------- */
  const q = $('#quote q');
  const qWords = splitWords(q);
  const qp = $('#quotePath');
  const ql = qp.getTotalLength();
  gsap.set(qp, { strokeDasharray: ql, strokeDashoffset: ql });
  const quoteTl = gsap.timeline({ scrollTrigger: { trigger: '#quote', start: 'top top', end: '+=100%', pin: true, scrub: 0.6, refreshPriority: 1 } });
  quoteTl.to(qWords, { opacity: 1, stagger: 0.15, ease: 'none' }, 0)
         .to(qp, { strokeDashoffset: 0, ease: 'none', duration: 1.2 }, 0)
         .from('#quote blockquote p, #quote cite', { y: 30, opacity: 0, stagger: 0.1, duration: 0.4 }, 0.8);

  /* ---------------- founder + wordmark ---------------- */
  gsap.from('.founder', { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.why-grid', start: 'top 80%' } });
  gsap.from('#wordmark span', { yPercent: 110, duration: 1.2, stagger: 0.035, ease: 'expo.out', scrollTrigger: { trigger: '#wordmark', start: 'top 95%' } });
  gsap.from('.faq-list details', { y: 30, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: '.faq-list', start: 'top 88%' } });
  gsap.from('.form .field, .form .btn', { y: 30, opacity: 0, duration: 0.9, stagger: 0.06, ease: 'expo.out', scrollTrigger: { trigger: '.form', start: 'top 88%' } });

  /* =========================================================
     POINTER FX: cursor, magnetic buttons, tilt cards
     ========================================================= */
  function cursorText() {}
  if (fine) {
    document.body.classList.add('has-cursor');
    const cur = $('#cursor'), dot = $('#cursorDot'), lbl = $('span', cur);
    const cx = gsap.quickTo(cur, 'x', { duration: 0.45, ease: 'power3' });
    const cy = gsap.quickTo(cur, 'y', { duration: 0.45, ease: 'power3' });
    const dx = gsap.quickSetter(dot, 'x', 'px'), dy = gsap.quickSetter(dot, 'y', 'px');
    addEventListener('pointermove', e => { cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY); });
    document.addEventListener('pointerover', e => { cur.classList.toggle('is-link', !!e.target.closest('a,button,summary,select,input,textarea')); });
    cursorText = (t) => { cur.classList.toggle('is-view', !!t); if (t) lbl.textContent = t; };

    $$('.magnetic').forEach(b => {
      const bx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), by = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); bx((e.clientX - r.left - r.width / 2) * 0.3); by((e.clientY - r.top - r.height / 2) * 0.4); });
      b.addEventListener('pointerleave', () => { gsap.to(b, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,0.4)' }); });
    });

    $$('.tilt').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(c, { rotateY: px * 7, rotateX: -py * 7, transformPerspective: 1000, duration: 0.6, ease: 'power3' });
      });
      c.addEventListener('pointerleave', () => gsap.to(c, { rotateX: 0, rotateY: 0, duration: 0.9, ease: 'power3' }));
    });
  }

  ST.sort();
  addEventListener('load', () => ST.refresh());
})();
