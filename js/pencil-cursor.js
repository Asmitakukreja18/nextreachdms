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
      // Responsive linear interpolation (lerp) for snappy, fluid 60/120fps motion
      const diff = targetY - currentY;
      if (Math.abs(diff) > 0.2) {
        currentY += diff * 0.45;
      } else {
        currentY = targetY;
      }

      // A. Solid Top Progress Line (0% to 100%) with head arrow
      const maxScroll = getScrollMax();
      const scrollPct = Math.min(100, Math.max(0, (currentY / maxScroll) * 100));

      if (progressBar) {
        progressBar.style.setProperty('width', scrollPct + '%', 'important');
        // Hide top progress fill and its head arrow at initial top (scrollPct <= 0.3%)
        // so arrow doesn't stick out at top-left before user scrolls
        progressBar.style.opacity = scrollPct > 0.3 ? '1' : '0';
      }

      // Emerge Factor: Snappy, smooth transition from tucked inside header to emerged
      const winW = window.innerWidth || document.documentElement.clientWidth || 1;
      const isMobile = winW < 768;
      const emergeDistance = isMobile ? 22 : 30;
      const emergeFactor = Math.min(1, Math.max(0, currentY / emergeDistance));

      // B. Floating Sinusoidal Wave Pencil Motion & Dashed Trail
      const px = 25 + (scrollPct / 100) * (winW - 75);
      const isHeaderHidden = headerNav && headerNav.classList.contains('nav-hidden');
      const headerH = headerNav ? headerNav.offsetHeight : (isMobile ? 70 : 80);
      
      // Base line for the wave: hugs the header border when visible (or top: 26px when header auto-hides)
      const normalBaseY = isHeaderHidden ? (isMobile ? 22 : 28) : (headerH + (isMobile ? 3 : 5));
      // In the starting scroll, tuck the pencil upwards inside the header (behind the header nav)
      const tuckOffset = (1 - emergeFactor) * (isMobile ? -38 : -48);
      const waveBaseY = normalBaseY + tuckOffset;

      const waveAmp = (isMobile ? 14 : 18) * emergeFactor; // Dynamic wave oscillation activates as pencil emerges
      const waveLength = isMobile ? 150 : 200; // Spatial wavelength in pixels for prominent undulating waves
      const k = (2 * Math.PI) / waveLength;

      // Pure sinusoidal spatial height function
      const getWaveY = (x) => waveBaseY + Math.sin(x * k) * waveAmp;

      const waveY = getWaveY(px);
      const slope = Math.cos(px * k) * waveAmp * k;
      const waveAngle = Math.atan(slope) * (180 / Math.PI); // Pencil tilts dynamically along wave slope
      const rad = (waveAngle * Math.PI) / 180;

      const halfW = isMobile ? 22 : 26;
      const halfH = isMobile ? 17 : 20;

      if (pencilRider) {
        pencilRider.style.transform = `translate3d(${(px - halfW).toFixed(1)}px, ${(waveY - halfH).toFixed(1)}px, 0) rotate(${waveAngle.toFixed(1)}deg)`;
        // Smoothly fade from 0 (inside header at start) to 1 as it emerges
        pencilRider.style.opacity = emergeFactor > 0.05 ? ((emergeFactor - 0.05) / 0.95).toFixed(3) : '0';
      }

      // Calculate exact coordinate of the orange eraser base (bottom-left of pencil)
      const offX = isMobile ? -17 : -20;
      const offY = isMobile ? 12 : 14;
      const rotX = offX * Math.cos(rad) - offY * Math.sin(rad);
      const rotY = offX * Math.sin(rad) + offY * Math.cos(rad);
      const eraserX = px + rotX;
      const eraserY = waveY + rotY;

      // C. Curved Sinusoidal Dashed Polyline Trail trailing cleanly behind the eraser along the wave
      if (dashedPolyline) {
        if (emergeFactor < 0.1) {
          dashedPolyline.setAttribute('points', '');
        } else {
          const offsetToEraser = eraserY - getWaveY(eraserX);
          const maxTrailLen = (isMobile ? 160 : 220) * emergeFactor;
          const trailLen = Math.min(Math.max(0, eraserX - 15), maxTrailLen);
          const numPoints = 26;

          if (trailLen > 6) {
            const trailPoints = [];
            for (let i = numPoints; i >= 0; i--) {
              const ptX = eraserX - (trailLen * (i / numPoints));
              if (ptX < 0) continue;
              const ptY = getWaveY(ptX) + offsetToEraser;
              trailPoints.push(ptX.toFixed(1) + ',' + ptY.toFixed(1));
            }
            dashedPolyline.setAttribute('points', trailPoints.join(' '));
          } else {
            dashedPolyline.setAttribute('points', '');
          }
        }
      }

      if (Math.abs(targetY - currentY) > 0.2) {
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
