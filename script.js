(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const scenes = $$('.scene');
  const history = ['intro'];
  const backBtn = $('#backBtn');

  const showScene = (name, { push = true } = {}) => {
    scenes.forEach(s => s.classList.toggle('active', s.dataset.scene === name));
    if (push && history[history.length - 1] !== name) history.push(name);
    backBtn.classList.toggle('hidden', name === 'intro' || name === 'finale');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof resetDodgy === 'function') resetDodgy();
    if (name === 'finale') burstHearts(80);
    if (name === 'memories') resetCarousel();
  };

  // Any button with data-next moves scenes
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-next]');
    if (!btn) return;
    showScene(btn.dataset.next);
  });

  backBtn.addEventListener('click', () => {
    if (history.length <= 1) return;
    history.pop();
    showScene(history[history.length - 1], { push: false });
  });

  // ---------- Dodgy "No" button ----------
  // Orbits its sibling "Yes" button within a small radius, always on-screen.
  const clampInViewport = (x, y, w, h) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const padX = 8, padTop = 70, padBottom = 24;
    return [
      Math.max(padX, Math.min(vw - w - padX, x)),
      Math.max(padTop, Math.min(vh - h - padBottom, y)),
    ];
  };

  const dodge = (el) => {
    // Portal to <body> so position:fixed is relative to the viewport,
    // not the .card (whose backdrop-filter creates a containing block).
    if (el.parentElement !== document.body) {
      el.dataset.homeParent = 'card';
      const holder = document.createElement('span');
      holder.className = 'dodgy-holder';
      el.parentNode.insertBefore(holder, el);
      el._dodgyHolder = holder;
      document.body.appendChild(el);
    }

    const rect = el.getBoundingClientRect();
    // Find the sibling Yes button in the currently active scene
    const scene = document.querySelector('.scene.active');
    const yes = scene ? scene.querySelector('.btn.primary') : null;
    const anchor = (yes || el).getBoundingClientRect();
    const cx = anchor.left + anchor.width / 2;
    const cy = anchor.top + anchor.height / 2;

    const vw = window.innerWidth, vh = window.innerHeight;
    const maxR = Math.max(80, Math.min(vw, vh) * 0.22);
    const minR = Math.max(60, rect.width * 0.7);
    const r = minR + Math.random() * (maxR - minR);
    const angle = Math.random() * Math.PI * 2;

    const nx = cx + Math.cos(angle) * r - rect.width / 2;
    const ny = cy + Math.sin(angle) * r - rect.height / 2;
    const [x, y] = clampInViewport(nx, ny, rect.width, rect.height);

    el.style.position = 'fixed';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.transform = `rotate(${(Math.random() * 16 - 8).toFixed(1)}deg)`;
    el.style.zIndex = 20;
  };

  $$('.dodgy').forEach(el => {
    const trigger = () => dodge(el);
    el.addEventListener('mouseenter', trigger);
    el.addEventListener('focus', trigger);
    el.addEventListener('touchstart', (e) => { e.preventDefault(); trigger(); }, { passive: false });
    el.addEventListener('click', (e) => { e.preventDefault(); trigger(); });
  });

  // Reset positions AND move dodgy buttons back to their home card
  const resetDodgy = () => {
    $$('.dodgy').forEach(el => {
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.transform = '';
      el.style.zIndex = '';
      if (el._dodgyHolder && el._dodgyHolder.parentNode) {
        el._dodgyHolder.parentNode.insertBefore(el, el._dodgyHolder);
        el._dodgyHolder.remove();
        el._dodgyHolder = null;
      }
    });
  };

  // ---------- Floating hearts ----------
  const heartsLayer = $('#heartsLayer');
  const HEART_EMOJI = ['💗','💖','💕','💘','🌸','✨','💝'];
  const spawnHeart = () => {
    const h = document.createElement('span');
    h.className = 'heart';
    h.textContent = HEART_EMOJI[Math.floor(Math.random() * HEART_EMOJI.length)];
    h.style.left = Math.random() * 100 + 'vw';
    h.style.fontSize = (16 + Math.random() * 26) + 'px';
    const dur = 8 + Math.random() * 8;
    h.style.animationDuration = dur + 's';
    heartsLayer.appendChild(h);
    setTimeout(() => h.remove(), dur * 1000 + 500);
  };
  setInterval(spawnHeart, 700);
  for (let i = 0; i < 10; i++) setTimeout(spawnHeart, i * 200);

  const burstHearts = (n) => {
    for (let i = 0; i < n; i++) setTimeout(spawnHeart, i * 30);
  };

  // ---------- Carousel ----------
  const track = $('#carTrack');
  const dotsWrap = $('#carDots');
  const slides = $$('.car-slide', track);
  let idx = 0;

  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.className = 'car-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('aria-label', `Go to photo ${i + 1}`);
    d.addEventListener('click', () => go(i));
    dotsWrap.appendChild(d);
  });

  const go = (i) => {
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    $$('.car-dot', dotsWrap).forEach((d, k) => d.classList.toggle('active', k === idx));
  };
  const resetCarousel = () => go(0);

  $('#carPrev').addEventListener('click', () => go(idx - 1));
  $('#carNext').addEventListener('click', () => go(idx + 1));

  // ---------- Photo placeholder fallback (used inline in HTML) ----------
  window.makePlaceholder = (n) => {
    const el = document.createElement('div');
    el.className = 'photo-placeholder';
    const emojis = ['💗','🌸','✨'];
    const captions = ['Add photo1.jpg', 'Add photo2.jpg', 'Add photo3.jpg'];
    el.innerHTML = `
      <div>
        <span class="ph-emoji">${emojis[n - 1] || '💗'}</span>
        <span>Us together</span>
        <small>${captions[n - 1] || ''}</small>
      </div>`;
    return el;
  };

  // ---------- Envelope ----------
  const envelope = $('#envelope');
  const envSkip = $('#envelopeSkip');
  envelope.addEventListener('click', () => {
    envelope.classList.add('opening');
    burstHearts(30);
    setTimeout(() => showScene('letter'), 700);
  });
  envSkip.addEventListener('click', () => showScene('letter'));

  // ---------- Music ----------
  const musicBtn = $('#musicBtn');
  const audio = $('#bgAudio');
  const label = $('#musicLabel');
  let playing = false;

  const setMusic = async (on) => {
    if (on) {
      try {
        await audio.play();
        playing = true;
      } catch {
        playing = false;
        label.textContent = 'Add song.mp3';
        setTimeout(() => (label.textContent = 'Music'), 2200);
        musicBtn.setAttribute('aria-pressed', 'false');
        return;
      }
    } else {
      audio.pause();
      playing = false;
    }
    musicBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    label.textContent = playing ? 'Playing 💗' : 'Music';
  };

  musicBtn.addEventListener('click', () => setMusic(!playing));

  // Try autoplay immediately; if the browser blocks it, start on the
  // very first user interaction of any kind (click, tap, key press).
  const kickoffMusic = () => {
    if (playing) return;
    setMusic(true);
  };

  // 1) Attempt right away (works if user already interacted with the site domain)
  audio.play().then(() => {
    playing = true;
    musicBtn.setAttribute('aria-pressed', 'true');
    label.textContent = 'Playing 💗';
  }).catch(() => {
    // 2) Fall back: start on first interaction of any kind
    const first = () => {
      kickoffMusic();
      ['pointerdown','touchstart','keydown','click'].forEach(ev =>
        document.removeEventListener(ev, first, true));
    };
    ['pointerdown','touchstart','keydown','click'].forEach(ev =>
      document.addEventListener(ev, first, { capture: true, once: false }));
  });

  // ---------- Replay ----------
  $('#replayBtn').addEventListener('click', () => {
    history.length = 0;
    history.push('intro');
    showScene('intro', { push: false });
  });
})();
