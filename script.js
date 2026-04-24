// script.js

const feed = document.getElementById("feed");

/*
Global sound state
true  = muted
false = unmuted
Starts muted
*/
let globalMuted = true;

/*
Build reels
*/
reels.forEach((item, index) => {
  const reel = document.createElement("section");
  reel.className = "reel";

  reel.innerHTML = `
    <div class="topBadge">For Meri Jaan Ashu ❤️</div>

    <video
      ${globalMuted ? "muted" : ""}
      loop
      playsinline
      preload="${index < 2 ? "auto" : "metadata"}"
    >
      <source src="${item.file}" type="video/mp4">
    </video>

    <div class="overlay">
      ${
        index === 0
          ? `<div class="tapHint">
               Tap video for sound 🔊
             </div>`
          : ""
      }
    </div>
  `;

  feed.appendChild(reel);
});

const videos = document.querySelectorAll("video");

/*
Apply mute state to all videos
*/
function applyGlobalMuteState() {
  videos.forEach(video => {
    video.muted = globalMuted;
  });
}

/*
Get currently visible video
*/
function getActiveVideo() {
  let active = null;

  videos.forEach(video => {
    const rect = video.getBoundingClientRect();

    if (
      rect.top < window.innerHeight * 0.5 &&
      rect.bottom > window.innerHeight * 0.5
    ) {
      active = video;
    }
  });

  return active;
}

/*
Autoplay visible reel only
Pause hidden reels
Preload next reel
*/
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const video = entry.target;

    if (entry.isIntersecting) {
      video.muted = globalMuted;

      video.play().catch(() => {});

      const nextReel = video.closest(".reel").nextElementSibling;

      if (nextReel) {
        const nextVideo = nextReel.querySelector("video");

        if (nextVideo) {
          nextVideo.preload = "auto";
          nextVideo.muted = globalMuted;
        }
      }

    } else {
      video.pause();
      video.currentTime = 0;
    }
  });
}, {
  threshold: 0.7
});

/*
Controls:
Tap = mute/unmute
Long press = pause
Release = resume
*/
videos.forEach(video => {

  observer.observe(video);

  let pressTimer = null;
  let longPressed = false;

  const startPress = () => {
    longPressed = false;

    pressTimer = setTimeout(() => {
      longPressed = true;
      video.pause();
    }, 300);
  };

  const endPress = () => {
    clearTimeout(pressTimer);

    if (longPressed) {
      video.play().catch(() => {});
    }
  };

  /*
  Tap for sound toggle
  Ignore if it was long press
  */
  video.addEventListener("click", () => {
    if (longPressed) return;

    globalMuted = !globalMuted;
    applyGlobalMuteState();

    const active = getActiveVideo() || video;
    active.play().catch(() => {});

    const hint = document.querySelector(".tapHint");
    if (hint) hint.remove();
  });

  /*
  Mobile
  */
  video.addEventListener("touchstart", startPress);
  video.addEventListener("touchend", endPress);
  video.addEventListener("touchcancel", endPress);

  /*
  Desktop
  */
  video.addEventListener("mousedown", startPress);
  video.addEventListener("mouseup", endPress);
  video.addEventListener("mouseleave", endPress);

});