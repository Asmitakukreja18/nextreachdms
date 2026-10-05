/**
 * NextReach DMS — Top Scroll Progress Track with Waving Pencil Rider & Trailing Marks
 * 
 * Behavior:
 * - Normal system arrow cursor on screen (no custom pencil cursor on mouse)
 * - In Hero Section (scrollY <= 90px) OR scrolling UP: Show Header (#mainNavbar), Hide Pencil Progress Track
 * - Scrolling DOWN (scrollY > 90px): Hide Header (nav-hidden), Show Pencil Progress Track (track-visible)
 * - Pencil advances smoothly with scroll percentage from 0% to 100%
 * - Animates in playful sinusoidal waves while scrolling ("like in wave" bobbing & tilting)
 * - Leaves trailing sketch dots behind the pencil
 * - Reaches the black arrow ► at the end of the page
 */
(function () {
  'use strict';

  function initPencilProgressSystem() {
    if (window._pencilProgressInitialized) return;
    window._pencilProgressInitialized = true;

    // Clean up any obsolete pencil cursor elements or canvas
    const oldPencil = document.getElementById('handDrawnPencil');
    if (oldPencil) oldPencil.remove();
    const oldCanvas = document.getElementById('pencilTrailCanvas');
    if (oldCanvas) oldCanvas.remove();
    const oldCursorStyle = document.getElementById('pencilCursorHideStyle');
    if (oldCursorStyle) oldCursorStyle.remove();

    // 1. Ensure Top Scroll Progress Track exists
    let progressTrack = document.getElementById('scrollProgressTrack');
    if (!progressTrack) {
      progressTrack = document.createElement('div');
      progressTrack.id = 'scrollProgressTrack';
      progressTrack.className = 'scroll-progress-track';
      progressTrack.setAttribute('aria-hidden', 'true');
      progressTrack.innerHTML = `
        <div class="scroll-progress-fill" id="scrollProgress">
          <div class="scroll-pencil-trail-dots" id="scrollPencilTrailDots">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div class="scroll-pencil-rider" id="scrollPencilRider" title="Scrolling progress...">
            <img src="images/chatgpt-pencil.png" alt="Waving Pencil Rider" class="rider-pencil-img">
          </div>
        </div>
        <div class="scroll-track-arrow">
          <svg class="scroll-track-arrow-svg" viewBox="0 0 10 12" width="10" height="12">
            <polygon points="0,0 10,6 0,12" fill="#17110F" />
          </svg>
        </div>
      `;
      document.body.prepend(progressTrack);
    }

    const progressBar = document.getElementById('scrollProgress');
    const pencilRider = document.getElementById('scrollPencilRider');
    const trailDots = document.getElementById('scrollPencilTrailDots');
    const headerNav = document.getElementById('mainNavbar') || document.querySelector('.header-nav');

    // 2. Physics & Sinusoidal Wave Dynamics ("like in wave")
    let scrollVelocity = 0;
    let wavePhase = 0;
    let isScrolling = false;
    let scrollStopTimer = null;
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    let isWaveAnimationRunning = false;

    function getScrollOffset() {
      return window.pageYOffset || document.documentElement.scrollTop || window.scrollY || document.body.scrollTop || 0;
    }

    function getScrollMax() {
      const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      );
      const winHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      return Math.max(1, docHeight - winHeight);
    }

    function updateProgress() {
      const currentY = getScrollOffset();
      const deltaY = currentY - lastScrollY;
      const absDy = Math.abs(deltaY);

      // A. Calculate scroll progress percentage (0% to 100%)
      const maxScroll = getScrollMax();
      const scrollPct = Math.min(100, Math.max(0, (currentY / maxScroll) * 100));

      if (progressBar) {
        progressBar.style.setProperty('width', scrollPct + '%', 'important');
      }

      // B. Scroll Direction Logic:
      // In Hero / Top section (scrollY <= 90px):
      // -> ALWAYS show Header, hide Pencil Track
      if (currentY <= 90) {
        if (headerNav) headerNav.classList.remove('nav-hidden');
        if (progressTrack) progressTrack.classList.remove('track-visible');
      } else {
        // Scrolling DOWN (deltaY > 2):
        // -> Hide Header, Show Pencil Track
        if (deltaY > 2) {
          if (headerNav) headerNav.classList.add('nav-hidden');
          if (progressTrack) progressTrack.classList.add('track-visible');
        }
        // Scrolling UP (deltaY < -4):
        // -> Show Header, Hide Pencil Track
        else if (deltaY < -4) {
          if (headerNav) headerNav.classList.remove('nav-hidden');
          if (progressTrack) progressTrack.classList.remove('track-visible');
        }
      }

      lastScrollY = currentY;

      // C. Wave dynamics impulse for smooth, slow, big fluid pencil waves
      scrollVelocity = Math.min(1.8, scrollVelocity * 0.80 + Math.min(absDy, 50) * 0.04 + 0.32);
      isScrolling = true;

      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(() => {
        isScrolling = false;
      }, 200);

      if (!isWaveAnimationRunning) {
        isWaveAnimationRunning = true;
        requestAnimationFrame(renderWaveMotion);
      }
    }

    function renderWaveMotion() {
      if (isScrolling) {
        wavePhase += 0.07; // Relaxed, slow, elegant wave frequency (was 0.20)
      } else {
        scrollVelocity *= 0.91; // Smooth spring dampening back to rest
        if (scrollVelocity < 0.015) {
          scrollVelocity = 0;
          isWaveAnimationRunning = false;
          if (pencilRider) {
            pencilRider.style.transform = 'translate3d(0, 0px, 0) rotate(0deg)';
          }
          if (trailDots) {
            trailDots.querySelectorAll('span').forEach(dot => dot.style.transform = 'translate3d(0, 0px, 0)');
          }
          return;
        }
      }

      // Big, Slow, Smooth Sinusoidal Waves ("pencil should take big waves, thoda slow wave le")
      const waveAngle = Math.sin(wavePhase) * (20 * scrollVelocity); // Graceful tilt wave ±20 deg
      const waveY = Math.sin(wavePhase) * (18 * scrollVelocity); // Big undulating waves: ±18px dip & crest

      if (pencilRider) {
        pencilRider.style.transform = `translate3d(0, ${waveY}px, 0) rotate(${waveAngle}deg)`;
      }

      if (trailDots) {
        const dots = trailDots.querySelectorAll('span');
        dots.forEach((dot, idx) => {
          const dotOffset = (idx + 1) * 0.22;
          const dotY = Math.sin(wavePhase - dotOffset) * (11 * scrollVelocity);
          dot.style.transform = `translate3d(0, ${dotY}px, 0)`;
        });
      }

      requestAnimationFrame(renderWaveMotion);
    }

    // Expose globally so other modules can trigger updates if needed
    window._pencilUpdateProgress = updateProgress;

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    // Initial check on page load
    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPencilProgressSystem);
  } else {
    initPencilProgressSystem();
  }
})();
