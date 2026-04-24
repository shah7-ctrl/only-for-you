// script.js

const feed = document.getElementById("feed");

/* ---------------------------------
   GLOBAL STATE
--------------------------------- */
let globalMuted = true;
let activeVideo = null;

/* ---------------------------------
   BUILD REELS
--------------------------------- */
reels.forEach((item, index) => {
  const reel = document.createElement("section");
  reel.className = "reel";

  reel.innerHTML = `
    <div class="topBadge">For Meri Jaan Ashu ❤️</div>

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
          ? `<div class="tapHint">Tap video for sound 🔊</div>`
          : ""
      }
    </div>
  `;

  feed.appendChild(reel);
});

const videos = document.querySelectorAll("video");

/* ---------------------------------
   HELPERS
--------------------------------- */

function stopAllVideos() {
  videos.forEach(video => {
    video.pause();
    video.currentTime = 0;
    video.muted = true;
  });
}

function preloadNext(video) {
  const nextReel = video.closest(".reel")?.nextElementSibling;
  if (!nextReel) return;

  const nextVideo = nextReel.querySelector("video");
  if (nextVideo) nextVideo.preload = "auto";
}

function setActiveVideo(video) {
  if (!video) return;

  activeVideo = video;

  videos.forEach(v => {
    if (v === video) {
      v.muted = globalMuted;
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
      v.muted = true;
    }
  });

  preloadNext(video);
}

function getMostVisibleVideo() {
  let best = null;
  let maxVisible = 0;

  videos.forEach(video => {
    const rect = video.getBoundingClientRect();

    const top = Math.max(rect.top, 0);
    const bottom = Math.min(rect.bottom, window.innerHeight);
    const visible = Math.max(0, bottom - top);

    if (visible > maxVisible) {
      maxVisible = visible;
      best = video;
    }
  });

  return best;
}

/* ---------------------------------
   SCROLL DETECT ACTIVE REEL
--------------------------------- */

let scrollTimer;

feed.addEventListener("scroll", () => {
  clearTimeout(scrollTimer);

  scrollTimer = setTimeout(() => {
    const target = getMostVisibleVideo();

    if (target && target !== activeVideo) {
      setActiveVideo(target);
    }
  }, 120);
});

/* first reel */
window.addEventListener("load", () => {
  if (videos[0]) setActiveVideo(videos[0]);
});

/* ---------------------------------
   TOUCH / CLICK CONTROLS
--------------------------------- */

videos.forEach(video => {

  let pressTimer = null;
  let longPressed = false;
  let moved = false;
  let startY = 0;

  /* TOUCH START */
  const touchStart = (e) => {
    longPressed = false;
    moved = false;

    startY = e.touches[0].clientY;

    pressTimer = setTimeout(() => {
      longPressed = true;

      if (video === activeVideo) {
        video.pause(); // pause only after true hold
      }

    }, 450); // longer delay avoids tap trigger
  };

  /* TOUCH MOVE = user scrolling */
  const touchMove = (e) => {
    const currentY = e.touches[0].clientY;

    if (Math.abs(currentY - startY) > 18) {
      moved = true;
      clearTimeout(pressTimer); // cancel long press if moving
    }
  };

  /* TOUCH END */
  const touchEnd = () => {
    clearTimeout(pressTimer);

    /* if actual long press */
    if (longPressed) {
      if (video === activeVideo) {
        video.play().catch(() => {});
      }
      return;
    }

    /* if scrolling movement happened */
    if (moved) return;

    /* normal tap = sound toggle only */
    globalMuted = !globalMuted;

    if (activeVideo) {
      activeVideo.muted = globalMuted;
      activeVideo.play().catch(() => {});
    }

    const hint = document.querySelector(".tapHint");
    if (hint) hint.remove();
  };

  /* MOBILE */
  video.addEventListener("touchstart", touchStart, { passive:true });
  video.addEventListener("touchmove", touchMove, { passive:true });
  video.addEventListener("touchend", touchEnd, { passive:true });
  video.addEventListener("touchcancel", touchEnd, { passive:true });

  /* DESKTOP CLICK */
  video.addEventListener("click", () => {
    globalMuted = !globalMuted;

    if (activeVideo) {
      activeVideo.muted = globalMuted;
      activeVideo.play().catch(() => {});
    }

    const hint = document.querySelector(".tapHint");
    if (hint) hint.remove();
  });

  /* DESKTOP HOLD */
  video.addEventListener("mousedown", () => {
    if (video === activeVideo) video.pause();
  });

  video.addEventListener("mouseup", () => {
    if (video === activeVideo) video.play().catch(() => {});
  });

  /* disable menu */
  video.addEventListener("contextmenu", e => {
    e.preventDefault();
  });

});