(() => {
  const scene = document.getElementById('envelopeScene');
  const openBtn = document.getElementById('openLetter');
  const letter = document.getElementById('letter');
  const closeBtn = document.getElementById('closeLetter');
  const heartRain = document.getElementById('heartRain');
  const layer = document.getElementById('heartLayer');
  const toast = document.getElementById('toast');
  const shareBtn = document.getElementById('sharePage');
  const music = document.getElementById('bgMusic');
  const musicBtn = document.getElementById('musicToggle');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let busy = false;
  let musicAvailable = false;

  const wait = ms => new Promise(resolve => setTimeout(resolve, reduceMotion ? 20 : ms));

  function showToast(message, duration = 2200) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  function burst(x = innerWidth / 2, y = innerHeight * .55, count = 24) {
    const symbols = ['♥','♡','✦','❀'];
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'floating-heart';
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      const dx = (Math.random() - .5) * Math.min(innerWidth * .72, 500);
      const dy = -(120 + Math.random() * 310);
      const rot = (Math.random() - .5) * 100;
      el.style.left = `${x + (Math.random() - .5) * 30}px`;
      el.style.top = `${y + (Math.random() - .5) * 18}px`;
      el.style.setProperty('--dx', `${dx}px`);
      el.style.setProperty('--dy', `${dy}px`);
      el.style.setProperty('--rot', `${rot}deg`);
      el.style.setProperty('--dur', `${1.8 + Math.random() * 1.4}s`);
      el.style.setProperty('--delay', `${Math.random() * .16}s`);
      layer.appendChild(el);
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }
  }

  function setMusicUI(playing) {
    musicBtn.classList.toggle('is-playing', playing);
    musicBtn.setAttribute('aria-label', playing ? 'Tắt nhạc' : 'Bật nhạc');
    musicBtn.title = playing ? 'Tắt nhạc' : 'Bật nhạc';
  }

  function enableMusicButton() {
    if (musicAvailable) return;
    musicAvailable = true;
    musicBtn.hidden = false;
  }

  music.volume = 0.58;
  music.addEventListener('loadedmetadata', enableMusicButton, { once: true });
  music.addEventListener('canplay', enableMusicButton, { once: true });
  music.addEventListener('play', () => setMusicUI(true));
  music.addEventListener('pause', () => setMusicUI(false));
  music.addEventListener('error', () => {
    musicAvailable = false;
    musicBtn.hidden = true;
  });

  musicBtn.addEventListener('click', async () => {
    if (!musicAvailable) return;
    try {
      if (music.paused) await music.play();
      else music.pause();
    } catch (_) {
      showToast('Chạm lại nút nhạc để phát ♫');
    }
  });

  async function tryStartMusicFromGesture() {
    if (!musicAvailable || !music.paused) return;
    try { await music.play(); } catch (_) { }
  }

  async function openLetter() {
    if (busy || letter.classList.contains('is-visible')) return;
    busy = true;
    openBtn.disabled = true;
    openBtn.setAttribute('aria-expanded', 'true');
    tryStartMusicFromGesture();

    scene.classList.add('is-opening');
    burst(innerWidth / 2, Math.min(innerHeight * .7, 620), 12);
    await wait(700);

    scene.classList.add('is-letter-rising');
    await wait(720);

    scene.classList.add('is-letter-unfolding');
    await wait(720);

    letter.classList.add('is-visible');
    letter.setAttribute('aria-hidden', 'false');
    await wait(120);
    letter.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    burst(innerWidth / 2, innerHeight * .72, 24);
    busy = false;
  }

  async function closeLetter() {
    if (busy || !letter.classList.contains('is-visible')) return;
    busy = true;
    letter.classList.add('is-hiding');
    await wait(380);
    letter.classList.remove('is-visible', 'is-hiding');
    letter.setAttribute('aria-hidden', 'true');
    scene.classList.remove('is-opening', 'is-letter-rising', 'is-letter-unfolding');
    openBtn.disabled = false;
    openBtn.setAttribute('aria-expanded', 'false');
    document.getElementById('top').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    busy = false;
  }

  openBtn.addEventListener('click', openLetter);
  closeBtn.addEventListener('click', closeLetter);

  heartRain.addEventListener('click', event => {
    const rect = event.currentTarget.getBoundingClientRect();
    burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 42);
    showToast('Một chút yêu thương đang bay đến em ♡');
  });

  shareBtn.addEventListener('click', async () => {
    const data = {
      title: 'Có một lá thư nhỏ dành cho em 💌',
      text: 'Anh có một điều muốn gửi em…',
      url: location.href.split('#')[0]
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(data.url);
        showToast('Đã sao chép link — cậu có thể gửi qua Mail hoặc WeChat ♡', 2600);
      } else {
        showToast('Hãy sao chép đường dẫn trên thanh địa chỉ để gửi nhé ♡', 2600);
      }
    } catch (error) {
      if (error?.name !== 'AbortError') showToast('Không thể mở bảng chia sẻ, hãy sao chép link nhé ♡');
    }
  });

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('seen'); });
      }, { threshold: .14 })
    : null;

  document.querySelectorAll('.reveal').forEach(el => {
    if (observer) observer.observe(el);
    else el.classList.add('seen');
  });
})();
