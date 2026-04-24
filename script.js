// script.js

const feed = document.getElementById("feed");

/* -----------------------------
   GLOBAL STATE
----------------------------- */
let globalMuted = true;
let activeVideo = null;

/* -----------------------------
   BUILD REELS
----------------------------- */
reels.forEach((item, index) => {

  const reel = document.createElement("section");
  reel.className = "reel";

  reel.innerHTML = `
    <div class="topBadge">For Meri Jaan Ashu ❤️</div>

    <button class="soundBtn">🔇</button>

    <video
      muted
      loop
      playsinline
      webkit-playsinline
      preload="${index < 2 ? "auto" : "metadata"}"
      controlslist="nodownload noplaybackrate nofullscreen"
      disablepictureinpicture
    >
      <source src="${item.file}" type="video/mp4">
    </video>

    <div class="overlay">
      ${
        index === 0
          ? `<div class="tapHint">
               Tap 🔇 for sound
             </div>`
          : ""
      }
    </div>
  `;

  feed.appendChild(reel);

});

const videos = document.querySelectorAll("video");
const buttons = document.querySelectorAll(".soundBtn");

/* -----------------------------
   HELPERS
----------------------------- */

function updateButtons() {
  buttons.forEach(btn => {
    btn.textContent = globalMuted ? "🔇" : "🔊";
  });
}

function stopAllExcept(video) {
  videos.forEach(v => {
    if (v === video) return;

    v.pause();
    v.currentTime = 0;
    v.muted = true;
  });
}

function preloadNext(video) {
  const nextReel =
    video.closest(".reel").nextElementSibling;

  if (!nextReel) return;

  const nextVideo = nextReel.querySelector("video");

  if (nextVideo) {
    nextVideo.preload = "auto";
  }
}

function setActiveVideo(video) {
  if (!video) return;

  activeVideo = video;

  stopAllExcept(video);

  video.muted = globalMuted;

  video.play().catch(() => {});

  preloadNext(video);

  updateButtons();
}

function getMostVisibleVideo() {
  let best = null;
  let maxVisible = 0;

  videos.forEach(video => {

    const rect =
      video.getBoundingClientRect();

    const top =
      Math.max(rect.top, 0);

    const bottom =
      Math.min(rect.bottom,
      window.innerHeight);

    const visible =
      Math.max(0, bottom - top);

    if (visible > maxVisible) {
      maxVisible = visible;
      best = video;
    }

  });

  return best;
}

/* -----------------------------
   SCROLL ACTIVE REEL
----------------------------- */

let scrollTimer = null;

feed.addEventListener("scroll", () => {

  clearTimeout(scrollTimer);

  scrollTimer = setTimeout(() => {

    const target =
      getMostVisibleVideo();

    if (
      target &&
      target !== activeVideo
    ) {
      setActiveVideo(target);
    }

  }, 120);

});

/* -----------------------------
   SOUND BUTTON
----------------------------- */

buttons.forEach(btn => {

  btn.addEventListener("click", e => {
    e.stopPropagation();

    globalMuted = !globalMuted;

    if (activeVideo) {
      activeVideo.muted = globalMuted;
      activeVideo.play().catch(() => {});
    }

    updateButtons();

    const hint =
      document.querySelector(".tapHint");

    if (hint) hint.remove();
  });

});

/* -----------------------------
   LONG PRESS PAUSE
----------------------------- */

videos.forEach(video => {

  let timer = null;
  let longPressed = false;
  let moved = false;
  let startY = 0;

  const touchStart = (e) => {

    longPressed = false;
    moved = false;

    startY =
      e.touches[0].clientY;

    timer = setTimeout(() => {

      longPressed = true;

      if (video === activeVideo) {
        video.pause();
      }

    }, 420);

  };

  const touchMove = (e) => {

    const y =
      e.touches[0].clientY;

    if (Math.abs(y - startY) > 25) {
      moved = true;
      clearTimeout(timer);
    }

  };

  const touchEnd = () => {

    clearTimeout(timer);

    if (longPressed) {

      if (video === activeVideo) {
        video.play().catch(() => {});
      }

      return;
    }

  };

  /* Mobile */
  video.addEventListener(
    "touchstart",
    touchStart,
    { passive:true }
  );

  video.addEventListener(
    "touchmove",
    touchMove,
    { passive:true }
  );

  video.addEventListener(
    "touchend",
    touchEnd,
    { passive:true }
  );

  video.addEventListener(
    "touchcancel",
    touchEnd,
    { passive:true }
  );

  /* Desktop hold */
  video.addEventListener(
    "mousedown",
    () => {
      if (video === activeVideo)
        video.pause();
    }
  );

  video.addEventListener(
    "mouseup",
    () => {
      if (video === activeVideo)
        video.play().catch(() => {});
    }
  );

  /* Block menu */
  video.addEventListener(
    "contextmenu",
    e => e.preventDefault()
  );

});

/* -----------------------------
   FIRST PLAY
----------------------------- */

window.addEventListener("load", () => {
  if (videos[0]) {
    setActiveVideo(videos[0]);
  }
});