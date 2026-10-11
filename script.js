(() => {
  const scene = document.getElementById('envelopeScene');
  const openBtn = document.getElementById('openLetter');
  const letter = document.getElementById('letter');
  const closeBtn = document.getElementById('closeLetter');
  const heartRain = document.getElementById('heartRain');
  const layer = document.getElementById('heartLayer');
  const toast = document.getElementById('toast');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let busy = false;

  const wait = ms => new Promise(r => setTimeout(r, reduceMotion ? 20 : ms));

  function burst(x = innerWidth / 2, y = innerHeight * .55, count = 24) {
    const symbols = ['♥','♡','✦','❀'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'floating-heart';
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      const dx = (Math.random() - .5) * Math.min(innerWidth * .75, 520);
      const dy = -(120 + Math.random() * 320);
      const rot = (Math.random() - .5) * 100;
      el.style.left = `${x + (Math.random() - .5) * 34}px`;
      el.style.top = `${y + (Math.random() - .5) * 20}px`;
      el.style.setProperty('--dx', `${dx}px`);
      el.style.setProperty('--dy', `${dy}px`);
      el.style.setProperty('--rot', `${rot}deg`);
      el.style.setProperty('--dur', `${1.8 + Math.random() * 1.5}s`);
      el.style.setProperty('--delay', `${Math.random() * .18}s`);
      layer.appendChild(el);
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }
  }

  async function openLetter() {
    if (busy || letter.classList.contains('is-visible')) return;
    busy = true;
    openBtn.disabled = true;
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('is-open');

    scene.classList.add('is-opening');
    burst(innerWidth / 2, Math.min(innerHeight * .7, 620), 12);
    await wait(720);

    scene.classList.add('is-letter-rising');
    await wait(760);

    scene.classList.add('is-letter-unfolding');
    await wait(760);

    letter.classList.add('is-visible');
    letter.setAttribute('aria-hidden', 'false');
    await wait(180);
    letter.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    burst(innerWidth / 2, innerHeight * .72, 24);
    busy = false;
  }

  async function closeLetter() {
    if (busy || !letter.classList.contains('is-visible')) return;
    busy = true;
    letter.classList.add('is-hiding');
    await wait(400);
    letter.classList.remove('is-visible', 'is-hiding');
    letter.setAttribute('aria-hidden', 'true');
    scene.classList.remove('is-opening', 'is-letter-rising', 'is-letter-unfolding');
    openBtn.disabled = false;
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('is-open');
    document.getElementById('top').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    busy = false;
  }

  openBtn.addEventListener('click', openLetter);
  closeBtn.addEventListener('click', closeLetter);

  heartRain.addEventListener('click', e => {
    const r = e.currentTarget.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 42);
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('seen'); });
  }, { threshold: .16 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();
