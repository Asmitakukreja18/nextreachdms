/**
 * NextReach DMS — Top Scroll Progress Track with Waving Pencil Rider & Trailing Marks
 * 
 * - Normal system arrow cursor on screen (no pencil cursor on mouse)
 * - Pencil rides at the leading tip of the top progress line all the way to the black arrow ►
 * - Animates softly in waves while scrolling ("like in wave" sinusoidal bobbing & tilting)
 * - Leaves small trailing sketch marks/dots behind the pencil ("apna mark chodte hue chota chota")
 * - Traverses all the way with the black arrow to the end of the page ("last tak jaari hai")
 */
(function () {
  'use strict';

  function initPencilProgressSystem() {
    if (window._pencilProgressInitialized) return;
    window._pencilProgressInitialized = true;

    // Clean up any old cursor elements or canvas trails
    const oldPencil = document.getElementById('handDrawnPencil');
    if (oldPencil) oldPencil.remove();
    const oldCanvas = document.getElementById('pencilTrailCanvas');
    if (oldCanvas) oldCanvas.remove();
    const oldCursorStyle = document.getElementById('pencilCursorHideStyle');
    if (oldCursorStyle) oldCursorStyle.remove();

    // 1. Ensure Top Scroll Progress Track with Waving Pencil Rider exists
    let progressTrack = document.getElementById('scrollProgressTrack');
    if (!progressTrack) {
      progressTrack = document.createElement('div');
      progressTrack.id = 'scrollProgressTrack';
      progressTrack.className = 'scroll-progress-track';
      progressTrack.setAttribute('aria-hidden', 'true');
      progressTrack.innerHTML = `
        <div class="scroll-progress-fill" id="scrollProgress">
          <div class="scroll-pencil-trail-dots" id="scrollPencilTrailDots">
            <span></span><span></span><span></span><span></span>
          </div>
          <div class="scroll-pencil-rider" id="scrollPencilRider" title="Scrolling progress...">
            <img src="images/cute-pencil-cursor.svg" alt="Waving Pencil Rider" class="rider-pencil-img">
          </div>
        </div>
        <div class="scroll-track-arrow">►</div>
      `;
      document.body.prepend(progressTrack);
    }

    const progressBar = document.getElementById('scrollProgress');
    const pencilRider = document.getElementById('scrollPencilRider');
    const trailDots = document.getElementById('scrollPencilTrailDots');

    // 2. Physics & Sinusoidal Wave Dynamics ("like in wave")
    let scrollVelocity = 0;
    let wavePhase = 0;
    let isScrolling = false;
    let scrollStopTimer = null;
    let lastScrollY = window.scrollY || window.pageYOffset || 0;
    let isWaveAnimationRunning = false;

    function updateProgress() {
      const currentY = window.scrollY || window.pageYOffset || 0;
      const dy = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;

      // Calculate scroll progress percentage (0 to 100%)
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPct = maxScroll > 0 ? Math.min(100, Math.max(0, (currentY / maxScroll) * 100)) : 0;

      if (progressBar) {
        progressBar.style.width = scrollPct + '%';
      }

      // Add scroll velocity impulse for fluid wave bobbing & tilting
      scrollVelocity = Math.min(1.8, scrollVelocity * 0.72 + Math.min(dy, 45) * 0.05 + 0.35);
      isScrolling = true;

      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(() => {
        isScrolling = false;
      }, 150);

      if (!isWaveAnimationRunning) {
        isWaveAnimationRunning = true;
        requestAnimationFrame(renderWaveMotion);
      }
    }

    function renderWaveMotion() {
      if (isScrolling) {
        wavePhase += 0.24; // Playful wave frequency
      } else {
        scrollVelocity *= 0.86; // Gentle spring dampening back to rest
        if (scrollVelocity < 0.015) {
          scrollVelocity = 0;
          isWaveAnimationRunning = false;
          if (pencilRider) {
            pencilRider.style.transform = 'translateY(0px) rotate(0deg)';
          }
          if (trailDots) {
            trailDots.style.transform = 'translateY(0px)';
          }
          return;
        }
      }

      // Soft sinusoidal wave calculations ("like in wave")
      const waveAngle = Math.sin(wavePhase) * (14 * scrollVelocity); // tilt wave: ±14 deg
      const waveY = Math.cos(wavePhase * 0.85) * (4.5 * scrollVelocity); // vertical wave: ±4.5px
      const trailY = Math.cos((wavePhase - 0.5) * 0.85) * (2 * scrollVelocity);

      if (pencilRider) {
        pencilRider.style.transform = `translate3d(0, ${waveY}px, 0) rotate(${waveAngle}deg)`;
      }

      if (trailDots) {
        trailDots.style.transform = `translate3d(0, ${trailY}px, 0)`;
      }

      requestAnimationFrame(renderWaveMotion);
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });

    // Initial positioning calculation
    updateProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPencilProgressSystem);
  } else {
    initPencilProgressSystem();
  }
})();
