// REPLACE your current script.js with this version

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

    <button class="reactBtn" data-id="${index}">
      ❤️
    </button>

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
const reactButtons = document.querySelectorAll(".reactBtn");

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

  const nextVideo =
    nextReel.querySelector("video");

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
      Math.min(rect.bottom, window.innerHeight);

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
   REACTION STORAGE
----------------------------- */

function loadReactions() {
  reactButtons.forEach(btn => {
    const id = btn.dataset.id;

    if (
      localStorage.getItem(
        "liked_" + id
      ) === "true"
    ) {
      btn.classList.add("liked");
    }
  });
}

function burstHeart(btn) {

  const heart =
    document.createElement("div");

  heart.className = "heartBurst";
  heart.textContent = "❤️";

  btn.parentElement.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 800);
}

/* -----------------------------
   SCROLL ACTIVE REEL
----------------------------- */

let scrollTimer = null;

feed.addEventListener("scroll", () => {

  if (activeVideo) {
    activeVideo.pause();
  }

  clearTimeout(scrollTimer);

  scrollTimer = setTimeout(() => {

    const target =
      getMostVisibleVideo();

    if (target) {
      setActiveVideo(target);
    }

  }, 90);

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
   REACTION BUTTON
----------------------------- */

reactButtons.forEach(btn => {

  btn.addEventListener("click", e => {

    e.stopPropagation();

    const id = btn.dataset.id;

    const liked =
      btn.classList.contains("liked");

    if (liked) {
      btn.classList.remove("liked");

      localStorage.setItem(
        "liked_" + id,
        "false"
      );

    } else {

      btn.classList.add("liked");

      localStorage.setItem(
        "liked_" + id,
        "true"
      );

      burstHeart(btn);
    }

  });

});

/* -----------------------------
   LONG PRESS PAUSE
----------------------------- */

videos.forEach(video => {

  let timer = null;
  let longPressed = false;
  let startY = 0;

  const touchStart = (e) => {

    longPressed = false;

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
      clearTimeout(timer);
    }

  };

  const touchEnd = () => {

    clearTimeout(timer);

    if (longPressed) {
      if (video === activeVideo) {
        video.play().catch(() => {});
      }
    }

  };

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

  video.addEventListener(
    "mousedown",
    () => {
      if (video === activeVideo) {
        video.pause();
      }
    }
  );

  video.addEventListener(
    "mouseup",
    () => {
      if (video === activeVideo) {
        video.play().catch(() => {});
      }
    }
  );

  video.addEventListener(
    "contextmenu",
    e => e.preventDefault()
  );

});

/* -----------------------------
   START
----------------------------- */

window.addEventListener("load", () => {

  loadReactions();

  if (videos[0]) {
    setActiveVideo(videos[0]);
  }

});