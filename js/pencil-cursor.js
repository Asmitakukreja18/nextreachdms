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

    // Clean up obsolete elements if present
    const oldDots = document.getElementById('scrollPencilTrailDots');
    if (oldDots) oldDots.remove();
    const oldFixedArrow = document.querySelector('.scroll-track-arrow');
    if (oldFixedArrow) oldFixedArrow.remove();

    // 1. Ensure Top Scroll Progress Track exists (Solid line with head arrow)
    let progressTrack = document.getElementById('scrollProgressTrack');
    if (!progressTrack) {
      progressTrack = document.createElement('div');
      progressTrack.id = 'scrollProgressTrack';
      progressTrack.className = 'scroll-progress-track';
      progressTrack.setAttribute('aria-hidden', 'true');
      progressTrack.innerHTML = '<div class="scroll-progress-fill" id="scrollProgress"></div>';
      document.body.prepend(progressTrack);
    }

    // 2. Ensure SVG Dashed Curved Trail exists
    let trailSvg = document.getElementById('pencilTrailSvg');
    if (!trailSvg) {
      trailSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      trailSvg.id = 'pencilTrailSvg';
      trailSvg.setAttribute('class', 'pencil-trail-svg');
      trailSvg.setAttribute('aria-hidden', 'true');
      trailSvg.innerHTML = '<polyline class="pencil-dashed-polyline" id="pencilDashedTrail" points=""></polyline>';
      document.body.prepend(trailSvg);
    }

    // 3. Ensure Pencil Rider exists and is attached to body for independent free wave motion
    let pencilRider = document.getElementById('scrollPencilRider');
    if (!pencilRider) {
      pencilRider = document.createElement('div');
      pencilRider.id = 'scrollPencilRider';
      pencilRider.className = 'scroll-pencil-rider';
      pencilRider.title = 'Scrolling progress...';
      pencilRider.innerHTML = '<img src="images/chatgpt-pencil.png" alt="Waving Pencil Rider" class="rider-pencil-img">';
      document.body.appendChild(pencilRider);
    } else if (pencilRider.parentElement && pencilRider.parentElement.id === 'scrollProgress') {
      document.body.appendChild(pencilRider);
    }

    const progressBar = document.getElementById('scrollProgress');
    const dashedPolyline = document.getElementById('pencilDashedTrail');
    const headerNav = document.getElementById('mainNavbar') || document.querySelector('.header-nav');

    // 4. Physics & Direct Scroll-Linked Dynamics (adwali.com style)
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

      // Header show/hide behavior (like adwali.com):
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

      // A. Solid Top Progress Line (0% to 100%) with head arrow
      const maxScroll = getScrollMax();
      const scrollPct = Math.min(100, Math.max(0, (currentY / maxScroll) * 100));

      if (progressBar) {
        progressBar.style.setProperty('width', scrollPct + '%', 'important');
      }

      // B. Floating Sinusoidal Pencil Motion with Big Sweeping Waves (dipping outside/below header)
      const winW = window.innerWidth || document.documentElement.clientWidth || 1;
      const px = 25 + (scrollPct / 100) * (winW - 75);
      const waveFreq = 0.0022; // Broad sweeping frequency
      const waveBaseY = winW < 768 ? 130 : 155; // Centered well below the 80px header
      const waveAmp = winW < 768 ? 52 : 72; // Deep 144px total vertical wave swoop
      const waveY = waveBaseY + Math.sin(currentY * waveFreq) * waveAmp;
      const waveAngle = Math.cos(currentY * waveFreq) * 26; // Dynamic slope tilt matching deep wave
      const rad = (waveAngle * Math.PI) / 180;

      if (pencilRider) {
        pencilRider.style.transform = `translate3d(${(px - 26).toFixed(1)}px, ${(waveY - 20).toFixed(1)}px, 0) rotate(${waveAngle.toFixed(1)}deg)`;
      }

      // Calculate exact position of the orange eraser base (bottom-left of pencil)
      // Vector from center to eraser is (-18px, +12px) unrotated
      const eraserX = px - 18 * Math.cos(rad) - 12 * Math.sin(rad);
      const eraserY = waveY - 18 * Math.sin(rad) + 12 * Math.cos(rad);

      // C. Curved Dashed Polyline Trail trailing cleanly behind the eraser
      if (dashedPolyline) {
        const trailPoints = [];
        const numPoints = 15; // Proportional, neat trail length matching pencil size
        const xStep = Math.max(7, winW * 0.009);
        for (let i = numPoints; i >= 0; i--) {
          const ptX = eraserX - (i * xStep);
          if (ptX < 0) continue;
          const lagY = currentY - (i * 44);
          const ptY = (waveBaseY + Math.sin(lagY * waveFreq) * waveAmp) + (eraserY - waveY);
          trailPoints.push(ptX.toFixed(1) + ',' + ptY.toFixed(1));
        }
        dashedPolyline.setAttribute('points', trailPoints.join(' '));
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
