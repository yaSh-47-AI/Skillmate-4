(() => {
  'use strict';

  const SESSION_KEY = 'hasSeenIntro';
  try {
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
  } catch (_) {}

  const isAppPath = window.location.pathname.startsWith('/app');
  const videoSrc = isAppPath ? '/app/intro.mp4' : '/intro.mp4';

  const style = document.createElement('style');
  style.id = 'sm-intro-splash-style';
  style.textContent = `
    #smIntroSplash {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100dvh;
      z-index: 999999;
      background: radial-gradient(circle at center, #141926 0%, #0B0D12 75%);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 1;
      transition: opacity 450ms cubic-bezier(0.4, 0, 0.2, 1);
    }
    #smIntroSplash.fade-out {
      opacity: 0;
      pointer-events: none;
    }
    #smIntroBgVideo {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(36px);
      opacity: 0.3;
      transform: scale(1.12);
      pointer-events: none;
    }
    #smIntroMainVideo {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      object-fit: contain;
      pointer-events: none;
    }
    #smIntroSkipBtn {
      position: fixed;
      top: calc(env(safe-area-inset-top, 0px) + 20px);
      right: 20px;
      z-index: 2;
      padding: 7px 15px;
      min-height: 34px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(15, 19, 28, 0.68);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      color: #F8FAFC;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: 0.01em;
      cursor: pointer;
      transition: transform 0.15s ease, background-color 0.15s ease;
    }
    #smIntroSkipBtn:active {
      transform: scale(0.95);
    }
  `;

  const overlay = document.createElement('div');
  overlay.id = 'smIntroSplash';
  overlay.setAttribute('aria-label', 'SkillMate intro video');
  overlay.innerHTML = `
    <video id="smIntroBgVideo" autoplay muted playsinline webkit-playsinline preload="auto" aria-hidden="true"></video>
    <video id="smIntroMainVideo" autoplay muted playsinline webkit-playsinline preload="auto"></video>
    <button type="button" id="smIntroSkipBtn" aria-label="Skip intro">Skip</button>
  `;

  let dismissed = false;
  let hasStartedPlaying = false;
  let stallTimer = null;

  function markSeen() {
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch (_) {}
  }

  function dismissSplash(immediate = false) {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(stallTimer);

    const cleanup = () => {
      overlay.remove();
      style.remove();
    };

    if (immediate) {
      cleanup();
      return;
    }

    overlay.classList.add('fade-out');
    setTimeout(cleanup, 460);
  }

  function configureVideoProps(videoEl) {
    videoEl.muted = true;
    videoEl.defaultMuted = true;
    videoEl.playsInline = true;
    videoEl.controls = false;
    videoEl.setAttribute('muted', '');
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('webkit-playsinline', '');
    videoEl.src = videoSrc;
  }

  function mountSplash() {
    if (!document.body) return;
    if (document.getElementById('smIntroSplash')) return;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    const mainVideo = document.getElementById('smIntroMainVideo');
    const bgVideo = document.getElementById('smIntroBgVideo');
    const skipBtn = document.getElementById('smIntroSkipBtn');

    if (!mainVideo) {
      dismissSplash(true);
      return;
    }

    configureVideoProps(mainVideo);
    if (bgVideo) configureVideoProps(bgVideo);

    // Smart Fit: use cover only when video & screen orientations match closely
    mainVideo.addEventListener('loadedmetadata', () => {
      const vw = mainVideo.videoWidth || 16;
      const vh = mainVideo.videoHeight || 9;
      const sw = window.innerWidth || 1;
      const sh = window.innerHeight || 1;
      const videoRatio = vw / vh;
      const screenRatio = sw / sh;
      const sameOrientation = (vw >= vh && sw >= sh) || (vh > vw && sh > sw);
      if (sameOrientation && Math.abs(videoRatio - screenRatio) < 0.35) {
        mainVideo.style.objectFit = 'cover';
      } else {
        mainVideo.style.objectFit = 'contain';
      }
    });

    const tryPlay = () => {
      if (dismissed) return;
      if (bgVideo) bgVideo.play().catch(() => {});
      const p = mainVideo.play();
      if (p && typeof p.catch === 'function') {
        p.catch(err => {
          // Only dismiss immediately if browser explicitly blocked autoplay (NotAllowedError)
          if (err && err.name === 'NotAllowedError') {
            dismissSplash(true);
          }
        });
      }
    };

    mainVideo.addEventListener('canplay', () => {
      if (!hasStartedPlaying && mainVideo.paused) tryPlay();
    });

    mainVideo.addEventListener('playing', () => {
      hasStartedPlaying = true;
      markSeen();
      clearTimeout(stallTimer);
    });

    mainVideo.addEventListener('ended', () => {
      markSeen();
      dismissSplash(false);
    });

    mainVideo.addEventListener('error', () => {
      dismissSplash(true);
    });

    skipBtn?.addEventListener('click', () => {
      markSeen();
      dismissSplash(false);
    });

    // 8-second stall fallback for Render cold starts / slow mobile networks
    stallTimer = setTimeout(() => {
      if (!hasStartedPlaying && (mainVideo.paused || mainVideo.readyState < 2)) {
        dismissSplash(true);
      }
    }, 8000);

    tryPlay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountSplash, { once: true });
  } else {
    mountSplash();
  }
})();
