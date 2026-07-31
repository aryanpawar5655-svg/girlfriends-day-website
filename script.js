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
  const clampInViewport = (x, y, w, h) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const pad = 16;
    return [
      Math.max(pad, Math.min(vw - w - pad, x)),
      Math.max(pad + 60, Math.min(vh - h - pad - 60, y)),
    ];
  };

  const dodge = (el) => {
    const rect = el.getBoundingClientRect();
    const nx = Math.random() * (window.innerWidth - rect.width);
    const ny = Math.random() * (window.innerHeight - rect.height);
    const [cx, cy] = clampInViewport(nx, ny, rect.width, rect.height);
    // Use fixed position + translate for smooth dodges
    el.style.position = 'fixed';
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    el.style.transform = `rotate(${(Math.random()*20-10).toFixed(1)}deg)`;
    el.style.zIndex = 20;
  };

  $$('.dodgy').forEach(el => {
    const trigger = () => dodge(el);
    el.addEventListener('mouseenter', trigger);
    el.addEventListener('focus', trigger);
    el.addEventListener('touchstart', trigger, { passive: true });
    el.addEventListener('click', (e) => { e.preventDefault(); trigger(); });
  });

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

  // Try to autoplay music after the first meaningful click
  let triedAutoplay = false;
  document.addEventListener('click', () => {
    if (triedAutoplay || playing) return;
    triedAutoplay = true;
    setMusic(true);
  }, { once: false });

  // ---------- Replay ----------
  $('#replayBtn').addEventListener('click', () => {
    history.length = 0;
    history.push('intro');
    showScene('intro', { push: false });
  });
})();
