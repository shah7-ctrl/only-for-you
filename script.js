// script.js

const feed = document.getElementById("feed");

/*
Global sound state
true  = muted
false = unmuted
*/
let globalMuted = true;

/* --------------------------
   BUILD REELS
-------------------------- */
reels.forEach((item, index) => {
  const reel = document.createElement("section");
  reel.className = "reel";

  reel.innerHTML = `
    <div class="topBadge">For Meri Jaan Ashu ❤️</div>

    <video
      ${globalMuted ? "muted" : ""}
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

/* --------------------------
   GLOBAL ACTIVE VIDEO
-------------------------- */
let activeVideo = null;

/* --------------------------
   HELPERS
-------------------------- */

function applyGlobalMuteState() {
  videos.forEach(video => {
    video.muted = globalMuted;
  });
}

function stopAllVideos() {
  videos.forEach(video => {
    video.pause();
  });
}

function setActiveVideo(video) {
  activeVideo = video;

  videos.forEach(v => {
    if (v === video) {
      v.muted = globalMuted;
      v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
      v.muted = true;   // critical fix
    }
  });

  preloadNext(video);
}

function preloadNext(video) {
  const nextReel = video.closest(".reel").nextElementSibling;

  if (!nextReel) return;

  const nextVideo = nextReel.querySelector("video");

  if (nextVideo) {
    nextVideo.preload = "auto";
  }
}

function getCenteredVideo() {
  let found = null;

  videos.forEach(video => {
    const rect = video.getBoundingClientRect();

    if (
      rect.top < window.innerHeight * 0.55 &&
      rect.bottom > window.innerHeight * 0.45
    ) {
      found = video;
    }
  });

  return found;
}

/* --------------------------
   INTERSECTION OBSERVER
-------------------------- */

const observer = new IntersectionObserver(entries => {

  entries.forEach(entry => {

    if (entry.isIntersecting) {
      setActiveVideo(entry.target);
    }

  });

}, {
  threshold: 0.8
});

videos.forEach(video => observer.observe(video));

/* --------------------------
   LONG PRESS + TAP
-------------------------- */

videos.forEach(video => {

  let timer = null;
  let longPressed = false;

  const startPress = (e) => {
    e.preventDefault();

    longPressed = false;

    timer = setTimeout(() => {
      longPressed = true;

      if (video === activeVideo) {
        video.pause();
      }

    }, 320);
  };

  const endPress = (e) => {
    e.preventDefault();

    clearTimeout(timer);

    if (longPressed) {
      if (video === activeVideo) {
        stopAllVideos();                 // critical fix
        video.muted = globalMuted;
        video.play().catch(() => {});
      }
    }
  };

  const tapToggle = () => {

    if (longPressed) return;

    globalMuted = !globalMuted;

    if (activeVideo) {
      setActiveVideo(activeVideo);
    }

    const hint = document.querySelector(".tapHint");
    if (hint) hint.remove();
  };

  /* Mobile */
  video.addEventListener(
    "touchstart",
    startPress,
    { passive:false }
  );

  video.addEventListener(
    "touchend",
    endPress,
    { passive:false }
  );

  video.addEventListener(
    "touchcancel",
    endPress,
    { passive:false }
  );

  /* Desktop */
  video.addEventListener("mousedown", startPress);
  video.addEventListener("mouseup", endPress);
  video.addEventListener("mouseleave", endPress);

  /* Tap */
  video.addEventListener("click", tapToggle);

  /* Block context menu */
  video.addEventListener(
    "contextmenu",
    e => e.preventDefault()
  );

});