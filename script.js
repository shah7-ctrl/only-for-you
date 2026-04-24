const feed = document.getElementById("feed");

/*
Global sound state:
true  = all current/next videos unmuted
false = all current/next videos muted
Starts muted
*/
let globalMuted = true;

reels.forEach((item, index) => {
  const reel = document.createElement("section");
  reel.className = "reel";

  reel.innerHTML = `
    <div class="topBadge">For My Ashu ❤️</div>

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
          ? `<div class="tapHint" style="margin-top:8px;font-size:14px;">
               Tap video for sound 🔊
             </div>`
          : ""
      }
    </div>
  `;

  feed.appendChild(reel);
});

const videos = document.querySelectorAll("video");

function applyGlobalMuteState() {
  videos.forEach(video => {
    video.muted = globalMuted;
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const video = entry.target;

    if (entry.isIntersecting) {
      video.muted = globalMuted;
      video.play();

      const next = video.closest(".reel").nextElementSibling;

      if (next) {
        const nextVideo = next.querySelector("video");
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

videos.forEach(video => {
  observer.observe(video);

  video.addEventListener("click", () => {
    globalMuted = !globalMuted;
    applyGlobalMuteState();

    const active = document.querySelector("video:hover") || video;
    active.play();

    // remove first hint permanently after first tap
    const hint = document.querySelector(".tapHint");
    if (hint) hint.remove();
  });
});