/* ====================================================================
   20/10 LOVE LETTER — SCRIPT.JS
   Chỉ điều khiển animation / tương tác. Nội dung thư nằm ở index.html.
   ==================================================================== */

(() => {
  "use strict";

  const scene = document.getElementById("envelopeScene");
  const openButton = document.getElementById("openLetter");
  const letter = document.getElementById("letter");
  const readAgainButton = document.getElementById("readAgain");
  const heartRainButton = document.getElementById("heartRain");
  const heartLayer = document.getElementById("heartLayer");
  const toast = document.getElementById("toast");
  const revealItems = document.querySelectorAll(".reveal-on-scroll");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let isOpening = false;
  let toastTimer = null;

  function smoothScrollTo(element) {
    element.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start"
    });
  }

  function makeHeartBurst(count = 18) {
    if (!heartLayer) return;

    const symbols = ["♡", "♥", "✦", "❀"];
    const palette = ["#b75e75", "#d6889b", "#9e4c63", "#c9a06d"];

    for (let index = 0; index < count; index += 1) {
      const heart = document.createElement("span");
      heart.className = "floating-heart";
      heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];

      heart.style.setProperty("--x", `${3 + Math.random() * 94}%`);
      heart.style.setProperty("--size", `${13 + Math.random() * 18}px`);
      heart.style.setProperty("--duration", `${4.4 + Math.random() * 2.8}s`);
      heart.style.setProperty("--delay", `${Math.random() * 0.75}s`);
      heart.style.setProperty("--drift", `${-30 + Math.random() * 60}px`);
      heart.style.setProperty("--heart-color", palette[Math.floor(Math.random() * palette.length)]);

      heartLayer.appendChild(heart);
      window.setTimeout(() => heart.remove(), 8500);
    }
  }

  function showToast() {
    if (!toast) return;

    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  function revealLetter(event) {
    event?.preventDefault();
    if (isOpening) return;

    isOpening = true;
    scene?.classList.add("is-opening");
    openButton?.setAttribute("aria-expanded", "true");
    document.body.classList.add("is-open");
    makeHeartBurst(reduceMotion ? 5 : 12);

    const openDelay = reduceMotion ? 20 : 1450;

    window.setTimeout(() => {
      letter?.classList.add("is-visible");

      // Cập nhật hash nhưng không làm trang giật ngay lập tức.
      if (history.replaceState) {
        history.replaceState(null, "", "#letter");
      }

      if (letter) smoothScrollTo(letter);
      isOpening = false;
    }, openDelay);
  }

  function resetLetter(event) {
    event?.preventDefault();
    scene?.classList.remove("is-opening");
    openButton?.setAttribute("aria-expanded", "false");
    letter?.classList.remove("is-visible");
    document.body.classList.remove("is-open");

    if (history.replaceState) {
      history.replaceState(null, "", "#top");
    }

    const top = document.getElementById("top");
    if (top) smoothScrollTo(top);
  }

  openButton?.addEventListener("click", revealLetter);
  readAgainButton?.addEventListener("click", resetLetter);

  heartRainButton?.addEventListener("click", () => {
    makeHeartBurst(reduceMotion ? 8 : 34);
    showToast();
  });

  // Ảnh hiện nhẹ khi cuộn đến. Nếu trình duyệt cũ không có IntersectionObserver,
  // chúng sẽ hiện luôn thay vì bị ẩn.
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-inview");
        currentObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.15,
      rootMargin: "0px 0px -6% 0px"
    });

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-inview"));
  }

  // Nếu ai đó mở link thẳng dạng .../#letter thì vẫn hiện thư.
  if (window.location.hash === "#letter") {
    scene?.classList.add("is-opening");
    openButton?.setAttribute("aria-expanded", "true");
    letter?.classList.add("is-visible");
    document.body.classList.add("is-open");
  }
})();
