/**
 * NextReach DMS — Top Scroll Progress Track with Waving Pencil Rider & Trailing Marks
 * 
 * - Normal system arrow cursor on screen (no pencil cursor on mouse)
 * - Fixed solid top progress line that NEVER hides on scroll (z-index: 9999999)
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

    // 1. Ensure Top Scroll Progress Track exists with solid fixed positioning
    let progressTrack = document.getElementById('scrollProgressTrack');
    if (!progressTrack) {
      progressTrack = document.createElement('div');
      progressTrack.id = 'scrollProgressTrack';
      progressTrack.className = 'scroll-progress-track';
      progressTrack.setAttribute('aria-hidden', 'true');
      progressTrack.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:4px;background:rgba(26,29,32,0.14);border-bottom:1.5px solid rgba(26,29,32,0.22);z-index:9999999;pointer-events:none;overflow:visible;';
      progressTrack.innerHTML = `
        <div class="scroll-progress-fill" id="scrollProgress" style="height:100%;width:0%;background:#17110F;position:relative;will-change:width;overflow:visible;">
          <div class="scroll-pencil-trail-dots" id="scrollPencilTrailDots" style="position:absolute;right:18px;top:1px;display:flex;align-items:center;gap:5px;pointer-events:none;">
            <span style="display:inline-block;width:3.5px;height:3.5px;border-radius:50%;background:#17110F;opacity:0.25;transform:scale(0.7);"></span>
            <span style="display:inline-block;width:3.5px;height:3.5px;border-radius:50%;background:#17110F;opacity:0.45;transform:scale(0.85);"></span>
            <span style="display:inline-block;width:3.5px;height:3.5px;border-radius:50%;background:#17110F;opacity:0.7;transform:scale(1);"></span>
            <span style="display:inline-block;width:3.5px;height:3.5px;border-radius:50%;background:#17110F;opacity:0.9;transform:scale(1.15);"></span>
          </div>
          <div class="scroll-pencil-rider" id="scrollPencilRider" title="Scrolling progress..." style="position:absolute;right:-8px;top:0px;width:34px;height:34px;pointer-events:none;will-change:transform;filter:drop-shadow(1px 3px 6px rgba(23,17,15,0.35));">
            <img src="images/cute-pencil-cursor.svg" alt="Waving Pencil Rider" class="rider-pencil-img" style="width:100%;height:100%;object-fit:contain;display:block;">
          </div>
        </div>
        <div class="scroll-track-arrow" style="position:absolute;right:0;top:-4px;display:flex;align-items:center;justify-content:center;">
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

    // 2. Physics & Sinusoidal Wave Dynamics ("like in wave")
    let scrollVelocity = 0;
    let wavePhase = 0;
    let isScrolling = false;
    let scrollStopTimer = null;
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || document.body.scrollTop || 0;
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
      const dy = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;

      // Calculate scroll progress percentage (0% to 100%)
      const maxScroll = getScrollMax();
      const scrollPct = Math.min(100, Math.max(0, (currentY / maxScroll) * 100));

      if (progressBar) {
        progressBar.style.width = scrollPct + '%';
      }

      // Add scroll velocity impulse for fluid wave bobbing & tilting
      scrollVelocity = Math.min(1.8, scrollVelocity * 0.72 + Math.min(dy, 45) * 0.05 + 0.35);
      isScrolling = true;

      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(() => {
        isScrolling = false;
      }, 160);

      if (!isWaveAnimationRunning) {
        isWaveAnimationRunning = true;
        requestAnimationFrame(renderWaveMotion);
      }
    }

    function renderWaveMotion() {
      if (isScrolling) {
        wavePhase += 0.24; // Playful wave frequency
      } else {
        scrollVelocity *= 0.86; // Smooth spring dampening back to rest
        if (scrollVelocity < 0.015) {
          scrollVelocity = 0;
          isWaveAnimationRunning = false;
          if (pencilRider) {
            pencilRider.style.transform = 'translate3d(0, 0px, 0) rotate(0deg)';
          }
          if (trailDots) {
            trailDots.style.transform = 'translate3d(0, 0px, 0)';
          }
          return;
        }
      }

      // Soft sinusoidal wave calculations ("like in wave")
      const waveAngle = Math.sin(wavePhase) * (14 * scrollVelocity); // tilt wave: ±14 deg
      const waveY = Math.abs(Math.sin(wavePhase * 0.85)) * (4.5 * scrollVelocity); // bobbing wave downwards
      const trailY = Math.abs(Math.sin((wavePhase - 0.5) * 0.85)) * (2.2 * scrollVelocity);

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
