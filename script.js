// script.js

const feed = document.getElementById("feed");

/* -------------------------
   GLOBAL STATE
------------------------- */
let globalMuted = true;
let activeVideo = null;

const emojiList = [
  "❤️",
  "😘",
  "😍",
  "😂",
  "🥺",
  "🔥"
];

/* -------------------------
   BUILD REELS
------------------------- */
reels.forEach((item, index) => {

  const reel = document.createElement("section");
  reel.className = "reel";

  reel.innerHTML = `
    <div class="topBadge">For My Ashu</div>

    <button
      class="soundBtn"
      type="button"
    >
      🔇
    </button>

    <button
      class="shareBtn"
      type="button"
      data-id="${index}"
    >
      💬
    </button>

    <button
      class="reactBtn"
      type="button"
      data-id="${index}"
    >
      ❤️
    </button>

    <video
      muted
      loop
      playsinline
      webkit-playsinline
      preload="${
        index < 2
          ? "auto"
          : "metadata"
      }"
      controlslist="
        nodownload
        noplaybackrate
        nofullscreen
      "
      disablepictureinpicture
    >
      <source
        src="${item.file}"
        type="video/mp4"
      >
    </video>

    <div class="overlay">
      ${
        index === 0
          ? `
            <div class="tapHint">
              Tap 🔇 for sound
            </div>
          `
          : ""
      }
    </div>
  `;

  feed.appendChild(reel);

});

/* -------------------------
   DOM SELECTORS
------------------------- */
const videos =
  document.querySelectorAll(
    "video"
  );

const soundButtons =
  document.querySelectorAll(
    ".soundBtn"
  );

const shareButtons =
  document.querySelectorAll(
    ".shareBtn"
  );

const reactButtons =
  document.querySelectorAll(
    ".reactBtn"
  );

/* -------------------------
   HELPERS
------------------------- */

function updateSoundButtons() {

  soundButtons.forEach(btn => {
    btn.textContent =
      globalMuted
        ? "🔇"
        : "🔊";
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
    video.closest(".reel")
    ?.nextElementSibling;

  if (!nextReel) return;

  const nextVideo =
    nextReel.querySelector(
      "video"
    );

  if (nextVideo) {
    nextVideo.preload =
      "auto";
  }

}

function setActiveVideo(video) {

  if (!video) return;

  activeVideo = video;

  stopAllExcept(video);

  video.muted =
    globalMuted;

  video.play()
    .catch(() => {});

  preloadNext(video);

  updateSoundButtons();

}

function getMostVisibleVideo() {

  let best = null;
  let maxVisible = 0;

  videos.forEach(video => {

    const rect =
      video.getBoundingClientRect();

    const top =
      Math.max(
        rect.top,
        0
      );

    const bottom =
      Math.min(
        rect.bottom,
        window.innerHeight
      );

    const visible =
      Math.max(
        0,
        bottom - top
      );

    if (
      visible >
      maxVisible
    ) {
      maxVisible =
        visible;

      best = video;
    }

  });

  return best;

}

function removeHint() {

  const hint =
    document.querySelector(
      ".tapHint"
    );

  if (hint) {
    hint.remove();
  }

}

/* -------------------------
   REACTIONS
------------------------- */

function burstEmoji(
  reel,
  emoji
) {

  const pop =
    document.createElement(
      "div"
    );

  pop.className =
    "emojiBurst";

  pop.textContent =
    emoji;

  reel.appendChild(pop);

  setTimeout(() => {
    pop.remove();
  }, 800);

}

function buildEmojiTrays() {

  reactButtons.forEach(btn => {

    const reel =
      btn.closest(
        ".reel"
      );

    const tray =
      document.createElement(
        "div"
      );

    tray.className =
      "emojiTray";

    emojiList.forEach(
      emoji => {

        const option =
          document.createElement(
            "button"
          );

        option.type =
          "button";

        option.className =
          "emojiOption";

        option.textContent =
          emoji;

        option.addEventListener(
          "click",
          e => {

            e.stopPropagation();

            const id =
              btn.dataset.id;

            localStorage.setItem(
              "liked_" + id,
              emoji
            );

            btn.textContent =
              emoji;

            tray.classList.remove(
              "show"
            );

            burstEmoji(
              reel,
              emoji
            );

          }
        );

        tray.appendChild(
          option
        );

      }
    );

    reel.appendChild(
      tray
    );

  });

}

function loadReactions() {

  reactButtons.forEach(btn => {

    const id =
      btn.dataset.id;

    const saved =
      localStorage.getItem(
        "liked_" + id
      );

    /* Ignore old boolean data */
    if (
      saved &&
      saved !== "true" &&
      saved !== "false"
    ) {

      btn.textContent =
        saved;

    } else {

      btn.textContent =
        "❤️";

    }

  });

}

function closeAllTrays() {

  document
    .querySelectorAll(
      ".emojiTray"
    )
    .forEach(tray => {
      tray.classList.remove(
        "show"
      );
    });

}

/* -------------------------
   SCROLL HANDLER
------------------------- */

let scrollTimer = null;

feed.addEventListener(
  "scroll",
  () => {

    if (activeVideo) {
      activeVideo.pause();
    }

    closeAllTrays();

    clearTimeout(
      scrollTimer
    );

    scrollTimer =
      setTimeout(() => {

        const target =
          getMostVisibleVideo();

        if (target) {
          setActiveVideo(
            target
          );
        }

      }, 90);

  }
);

/* -------------------------
   SOUND BUTTON
------------------------- */

soundButtons.forEach(btn => {

  btn.addEventListener(
    "click",
    e => {

      e.stopPropagation();

      globalMuted =
        !globalMuted;

      if (
        activeVideo
      ) {

        activeVideo.muted =
          globalMuted;

        activeVideo.play()
          .catch(() => {});

      }

      updateSoundButtons();

      removeHint();

    }
  );

});

/* -------------------------
   SHARE BUTTON
------------------------- */

shareButtons.forEach(btn => {

  btn.addEventListener(
    "click",
    e => {

      e.stopPropagation();

      const id =
        Number(
          btn.dataset.id
        ) + 1;

      const reelLink =
        window.location
          .origin +
        window.location
          .pathname +
        "?video=" +
        id;

      const text =
        reelLink;

      const url =
        "https://wa.me/918797204760?text=" +
        encodeURIComponent(
          text
        );

      window.open(
        url,
        "_blank"
      );

    }
  );

});

/* -------------------------
   REACT BUTTON
------------------------- */

reactButtons.forEach(btn => {

  btn.addEventListener(
    "click",
    e => {

      e.stopPropagation();

      const reel =
        btn.closest(
          ".reel"
        );

      const tray =
        reel.querySelector(
          ".emojiTray"
        );

      const isOpen =
        tray.classList.contains(
          "show"
        );

      closeAllTrays();

      if (!isOpen) {
        tray.classList.add(
          "show"
        );
      }

    }
  );

});

/* Close tray outside tap */
document.addEventListener(
  "click",
  () => {
    closeAllTrays();
  }
);

/* -------------------------
   LONG PRESS PAUSE
------------------------- */

videos.forEach(video => {

  let timer = null;
  let longPressed =
    false;
  let startY = 0;

  const touchStart =
    e => {

      longPressed =
        false;

      startY =
        e.touches[0]
          .clientY;

      timer =
        setTimeout(
          () => {

            longPressed =
              true;

            if (
              video ===
              activeVideo
            ) {
              video.pause();
            }

          },
          420
        );

    };

  const touchMove =
    e => {

      const y =
        e.touches[0]
          .clientY;

      if (
        Math.abs(
          y - startY
        ) > 25
      ) {
        clearTimeout(
          timer
        );
      }

    };

  const touchEnd =
    () => {

      clearTimeout(
        timer
      );

      if (
        longPressed
      ) {

        if (
          video ===
          activeVideo
        ) {
          video.play()
            .catch(() => {});
        }

      }

    };

  video.addEventListener(
    "touchstart",
    touchStart,
    {
      passive:true
    }
  );

  video.addEventListener(
    "touchmove",
    touchMove,
    {
      passive:true
    }
  );

  video.addEventListener(
    "touchend",
    touchEnd,
    {
      passive:true
    }
  );

  video.addEventListener(
    "touchcancel",
    touchEnd,
    {
      passive:true
    }
  );

  video.addEventListener(
    "mousedown",
    () => {

      if (
        video ===
        activeVideo
      ) {
        video.pause();
      }

    }
  );

  video.addEventListener(
    "mouseup",
    () => {

      if (
        video ===
        activeVideo
      ) {
        video.play()
          .catch(() => {});
      }

    }
  );

  video.addEventListener(
    "contextmenu",
    e => {
      e.preventDefault();
    }
  );

});

/* -------------------------
   STARTUP
------------------------- */

window.addEventListener(
  "load",
  () => {

    buildEmojiTrays();

    loadReactions();

    const params =
      new URLSearchParams(
        window.location
          .search
      );

    const videoNumber =
      parseInt(
        params.get(
          "video"
        )
      );

    if (
      videoNumber &&
      videoNumber >= 1 &&
      videoNumber <=
        videos.length
    ) {

      const target =
        videos[
          videoNumber - 1
        ];

      const reel =
        target.closest(
          ".reel"
        );

      reel.scrollIntoView({
        behavior:"auto",
        block:"start"
      });

      setTimeout(
        () => {

          setActiveVideo(
            target
          );

          window.history
            .replaceState(
              {},
              "",
              window.location
                .pathname
            );

        },
        180
      );

    } else {

      if (videos[0]) {
        setActiveVideo(
          videos[0]
        );
      }

    }

  }
);