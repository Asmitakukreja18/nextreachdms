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

    // 2. Physics & Direct Scroll-Linked Sinusoidal Dynamics (matching adwali.com)
    let currentY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
    let targetY = currentY;
    let lastY = currentY;
    let isTicking = false;

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
      targetY = getScrollOffset();

      // Ensure progress track is always visible once user interacts or scrolls
      if (progressTrack && !progressTrack.classList.contains('track-visible')) {
        progressTrack.classList.add('track-visible');
      }

      // Header show/hide behavior (like adwali.com):
      // Hide header when scrolling down past 120px; restore when scrolling up
      const dy = targetY - lastY;
      if (headerNav) {
        if (targetY > 120 && dy > 4) {
          headerNav.classList.add('nav-hidden');
        } else if (dy < -4 || targetY <= 120) {
          headerNav.classList.remove('nav-hidden');
        }
      }
      lastY = targetY;

      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(renderLoop);
      }
    }

    function renderLoop() {
      // Smooth linear interpolation (lerp) for buttery 60/120fps motion on mobile & desktop
      const diff = targetY - currentY;
      if (Math.abs(diff) > 0.4) {
        currentY += diff * 0.22;
      } else {
        currentY = targetY;
      }

      // A. Calculate scroll progress percentage (0% to 100%)
      const maxScroll = getScrollMax();
      const scrollPct = Math.min(100, Math.max(0, (currentY / maxScroll) * 100));

      if (progressBar) {
        progressBar.style.setProperty('width', scrollPct + '%', 'important');
      }

      // B. Big, Broad Sinusoidal Waves (matching adwali.com):
      // Wavelength is long and sweeping (~2600px of scroll per cycle) with deep 34px downward curve
      const waveFreq = 0.0024;
      const waveCycle = (1 - Math.cos(currentY * waveFreq)) * 0.5; // Smooth 0 to 1 cycle
      const waveY = waveCycle * 34; // Big, sweeping curve dipping down up to 34px into view
      const waveAngle = Math.sin(currentY * waveFreq) * 18; // Dynamic tilt ±18 deg matching wave slope

      if (pencilRider) {
        pencilRider.style.transform = `translate3d(0, ${waveY.toFixed(1)}px, 0) rotate(${waveAngle.toFixed(1)}deg)`;
      }

      // C. Trailing sketch marks waving in organic unison behind the pencil
      if (trailDots) {
        const dots = trailDots.querySelectorAll('span');
        dots.forEach((dot, idx) => {
          const lagY = Math.max(0, currentY - (idx + 1) * 45);
          const dotCycle = (1 - Math.cos(lagY * waveFreq)) * 0.5;
          const dotY = dotCycle * 22;
          dot.style.transform = `translate3d(0, ${dotY.toFixed(1)}px, 0)`;
        });
      }

      if (Math.abs(targetY - currentY) > 0.4) {
        requestAnimationFrame(renderLoop);
      } else {
        isTicking = false;
      }
    }

    // Expose globally so other modules can trigger updates if needed
    window._pencilUpdateProgress = updateProgress;

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('touchmove', updateProgress, { passive: true });
    window.addEventListener('touchend', updateProgress, { passive: true });
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
