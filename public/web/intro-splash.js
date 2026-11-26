(() => {
  'use strict';

  const SESSION_KEY = 'hasSeenIntro';
  try {
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
    sessionStorage.setItem(SESSION_KEY, '1');
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
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'smIntroSplash';
  overlay.setAttribute('aria-label', 'SkillMate intro video');
  overlay.innerHTML = `
    <video id="smIntroBgVideo" autoplay muted playsinline webkit-playsinline preload="auto" aria-hidden="true">
      <source src="${videoSrc}" type="video/mp4">
    </video>
    <video id="smIntroMainVideo" autoplay muted playsinline webkit-playsinline preload="auto">
      <source src="${videoSrc}" type="video/mp4">
    </video>
    <button type="button" id="smIntroSkipBtn" aria-label="Skip intro">Skip</button>
  `;

  let dismissed = false;
  let stallTimer = null;

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

  function mountSplash() {
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', mountSplash, { once: true });
      return;
    }
    document.body.appendChild(overlay);

    const mainVideo = document.getElementById('smIntroMainVideo');
    const bgVideo = document.getElementById('smIntroBgVideo');
    const skipBtn = document.getElementById('smIntroSkipBtn');

    if (!mainVideo) {
      dismissSplash(true);
      return;
    }

    mainVideo.controls = false;
    mainVideo.muted = true;
    mainVideo.defaultMuted = true;
    if (bgVideo) {
      bgVideo.controls = false;
      bgVideo.muted = true;
      bgVideo.defaultMuted = true;
    }

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

    mainVideo.addEventListener('playing', () => {
      clearTimeout(stallTimer);
    });

    mainVideo.addEventListener('ended', () => dismissSplash(false));
    mainVideo.addEventListener('error', () => dismissSplash(true));
    skipBtn?.addEventListener('click', () => dismissSplash(false));

    // Safety timeout if network stalls > 4.5s without playing
    stallTimer = setTimeout(() => {
      if (mainVideo.paused || mainVideo.readyState < 2) {
        dismissSplash(true);
      }
    }, 4500);

    const playPromise = mainVideo.play();
    if (bgVideo) bgVideo.play().catch(() => {});
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => dismissSplash(true));
    }
  }

  mountSplash();
})();
