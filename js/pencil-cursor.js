/**
 * NextReach DMS — Exact Hand-Drawn Waving Pencil Engine & Smooth Curved Trail
 * Features:
 * 1. Exact Reference Design (Pink tip, white body segments, yellow back cap)
 * 2. Real-time smooth curved sketch trail (quadratic bezier)
 * 3. Scroll-Linked Sinusoidal Waving Motion ("pencil should wave like small waves when scrolling")
 * 4. 100% Responsive: Desktop mouse cursor + Mobile top progress bar waving pencil rider
 */
(function () {
  'use strict';

  function initPencilSystem() {
    if (window._pencilSystemInitialized) return;
    window._pencilSystemInitialized = true;

    const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 992;

    // =========================================================================
    // 1. TOP PROGRESS TRACK WITH WAVING PENCIL RIDER (100% Responsive)
    // =========================================================================
    let progressTrack = document.getElementById('scrollProgressTrack');
    if (!progressTrack) {
      progressTrack = document.createElement('div');
      progressTrack.id = 'scrollProgressTrack';
      progressTrack.className = 'scroll-progress-track';
      progressTrack.setAttribute('aria-hidden', 'true');
      progressTrack.innerHTML = `
        <div class="scroll-progress-fill" id="scrollProgress">
          <div class="scroll-pencil-rider" id="scrollPencilRider" title="Scrolling...">
            <svg viewBox="0 0 48 48" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 8 36 L 27 17 L 33 23 L 14 42 Z" fill="rgba(23, 17, 15, 0.18)" />
              <polygon points="8,34 13,29 19,35 14,40" fill="#FFB800" stroke="#17110F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
              <polygon points="13,29 27,15 33,21 19,35" fill="#FFFFFF" stroke="#17110F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
              <line x1="17.7" y1="24.3" x2="23.7" y2="30.3" stroke="#17110F" stroke-width="1.8" stroke-linecap="round"/>
              <line x1="22.3" y1="19.7" x2="28.3" y2="25.7" stroke="#17110F" stroke-width="1.8" stroke-linecap="round"/>
              <circle cx="21" cy="25" r="1.4" fill="#17110F" opacity="0.65"/>
              <polygon points="27,15 36,9.6 38.4,12 33,21" fill="#FFFFFF" stroke="#17110F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
              <polygon points="36,9.6 42,6 38.4,12" fill="#FF2A6D" stroke="#17110F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
        <div class="scroll-track-arrow">►</div>
      `;
      document.body.prepend(progressTrack);
    }

    const progressBar = document.getElementById('scrollProgress');
    const pencilRider = document.getElementById('scrollPencilRider');

    // =========================================================================
    // 2. DESKTOP PENCIL CURSOR & REAL-TIME CURVED CANVAS TRAIL
    // =========================================================================
    let canvas = document.getElementById('pencilTrailCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'pencilTrailCanvas';
      canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:999990;';
      document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    let pencil = document.getElementById('handDrawnPencil');
    if (!pencil) {
      pencil = document.createElement('div');
      pencil.id = 'handDrawnPencil';
      pencil.setAttribute('aria-hidden', 'true');
      pencil.style.cssText = 'position:fixed;top:0;left:0;width:48px;height:48px;pointer-events:none;z-index:999999;transform:translate3d(-100px,-100px,0);filter:drop-shadow(2px 4px 6px rgba(23,17,15,0.25));will-change:transform;transition:opacity 0.2s ease, filter 0.15s ease;opacity:0;';
      pencil.innerHTML = `
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 8 36 L 27 17 L 33 23 L 14 42 Z" fill="rgba(23, 17, 15, 0.18)" />
          <polygon points="8,34 13,29 19,35 14,40" fill="#FFB800" stroke="#17110F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
          <polygon points="13,29 27,15 33,21 19,35" fill="#FFFFFF" stroke="#17110F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
          <line x1="17.7" y1="24.3" x2="23.7" y2="30.3" stroke="#17110F" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="22.3" y1="19.7" x2="28.3" y2="25.7" stroke="#17110F" stroke-width="1.8" stroke-linecap="round"/>
          <circle cx="21" cy="25" r="1.4" fill="#17110F" opacity="0.65"/>
          <polygon points="27,15 36,9.6 38.4,12 33,21" fill="#FFFFFF" stroke="#17110F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
          <polygon points="36,9.6 42,6 38.4,12" fill="#FF2A6D" stroke="#17110F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>
      `;
      document.body.appendChild(pencil);
    }

    // Hide native cursor only on desktop when mouse is active
    let cursorStyle = document.getElementById('pencilCursorHideStyle');
    function enablePencilCursor() {
      if (isTouchDevice()) return;
      if (!cursorStyle) {
        cursorStyle = document.createElement('style');
        cursorStyle.id = 'pencilCursorHideStyle';
        cursorStyle.textContent = `
          @media (min-width: 992px) {
            *, html, body, a, button, input, select, textarea, [role="button"] {
              cursor: none !important;
            }
          }
        `;
        document.head.appendChild(cursorStyle);
      }
      pencil.style.opacity = '1';
    }

    // =========================================================================
    // 3. MOUSE TRACKING & INTERACTIVE HOVER
    // =========================================================================
    const points = [];
    const maxPoints = 30;
    const maxAge = 580; // milliseconds
    let mouseX = -100, mouseY = -100;
    let isDrawing = false;
    let isHovering = false;
    let isMouseDown = false;

    // Wave Motion State Variables
    let scrollVelocity = 0;
    let wavePhase = 0;
    let isScrolling = false;
    let scrollStopTimer = null;
    let lastScrollY = window.scrollY;
    let isWaveAnimationRunning = false;

    function updatePencilPosition(waveX = 0, waveY = 0, waveAngle = 0) {
      if (isTouchDevice()) {
        pencil.style.opacity = '0';
        return;
      }
      if (mouseX < 0 || mouseY < 0) return;

      const scale = isMouseDown ? 0.92 : (isHovering ? 1.15 : 1);
      const baseRot = isHovering ? -6 : 0;
      const totalRot = baseRot + waveAngle;

      pencil.style.transform = `translate3d(${mouseX - 42 + waveX}px, ${mouseY - 6 + waveY}px, 0) scale(${scale}) rotate(${totalRot}deg)`;
    }

    window.addEventListener('mousemove', (e) => {
      enablePencilCursor();
      mouseX = e.clientX;
      mouseY = e.clientY;

      updatePencilPosition();

      points.push({
        x: mouseX,
        y: mouseY,
        time: performance.now()
      });

      if (points.length > maxPoints) {
        points.shift();
      }

      if (!isDrawing) {
        isDrawing = true;
        requestAnimationFrame(renderCurvedTrail);
      }
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      pencil.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      if (!isTouchDevice()) pencil.style.opacity = '1';
    });

    document.addEventListener('mousedown', () => {
      isMouseDown = true;
      updatePencilPosition(0, 2, -3);
    });

    document.addEventListener('mouseup', () => {
      isMouseDown = false;
      updatePencilPosition();
    });

    const hoverSelectors = 'a, button, [role="button"], .btn, .btn-orange, .btn-visit-live, .project-card, .tilt-card, input, select, textarea, .theme-toggle-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSelectors)) {
        isHovering = true;
        pencil.style.filter = 'drop-shadow(0 0 10px rgba(255, 42, 109, 0.8)) drop-shadow(2px 4px 6px rgba(23,17,15,0.3))';
        updatePencilPosition();
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSelectors)) {
        isHovering = false;
        pencil.style.filter = 'drop-shadow(2px 4px 6px rgba(23,17,15,0.25))';
        updatePencilPosition();
      }
    }, { passive: true });

    // =========================================================================
    // 4. SCROLL WAVING PHYSICS ENGINE ("pencil should wave like small waves")
    // =========================================================================
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      const dy = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;

      // Update Top Progress Bar
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPct = maxScroll > 0 ? (currentY / maxScroll) * 100 : 0;
      if (progressBar) {
        progressBar.style.width = scrollPct + '%';
      }

      // Smooth scroll velocity kick
      scrollVelocity = Math.min(1.6, scrollVelocity * 0.75 + Math.min(dy, 40) * 0.04 + 0.35);
      isScrolling = true;

      // Reset decay timer
      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(() => {
        isScrolling = false;
      }, 140);

      // Start wave RAF loop if not running
      if (!isWaveAnimationRunning) {
        isWaveAnimationRunning = true;
        requestAnimationFrame(renderScrollWaveMotion);
      }
    }, { passive: true });

    function renderScrollWaveMotion() {
      if (isScrolling) {
        wavePhase += 0.22; // Speed of the small waves
      } else {
        // Natural gentle spring dampening back to rest
        scrollVelocity *= 0.88;
        if (scrollVelocity < 0.015) {
          scrollVelocity = 0;
          isWaveAnimationRunning = false;
          updatePencilPosition(0, 0, 0);
          if (pencilRider) {
            pencilRider.style.transform = 'translateY(0px) rotate(0deg)';
            pencilRider.classList.remove('pencil-waving');
          }
          return;
        }
      }

      // Cute small wave calculations (amplitude & rotation undulation)
      const waveAngle = Math.sin(wavePhase) * (14 * scrollVelocity); // tilt wave: ±14 deg
      const waveY = Math.cos(wavePhase * 0.8) * (5 * scrollVelocity); // small vertical wave: ±5px
      const waveX = Math.sin(wavePhase * 0.6) * (3 * scrollVelocity); // slight lateral sway: ±3px

      // 1. Apply wave to desktop cursor pencil
      updatePencilPosition(waveX, waveY, waveAngle);

      // 2. Apply wave to top responsive rider pencil
      if (pencilRider) {
        const riderY = Math.sin(wavePhase * 1.2) * (4 * Math.min(1, scrollVelocity));
        const riderRot = Math.sin(wavePhase) * (15 * Math.min(1, scrollVelocity));
        pencilRider.style.transform = `translateY(${riderY}px) rotate(${riderRot}deg)`;
        pencilRider.classList.add('pencil-waving');
      }

      // 3. Add wave-rippled sketch trail while mouse is on screen and scrolling
      if (scrollVelocity > 0.3 && mouseX > 0 && mouseY > 0 && !isTouchDevice()) {
        points.push({
          x: mouseX + waveX * 0.7,
          y: mouseY + waveY * 0.7,
          time: performance.now()
        });
        if (!isDrawing) {
          isDrawing = true;
          requestAnimationFrame(renderCurvedTrail);
        }
      }

      requestAnimationFrame(renderScrollWaveMotion);
    }

    // =========================================================================
    // 5. SMOOTH CURVED CANVAS TRAIL RENDERING (Quadratic Splines)
    // =========================================================================
    function renderCurvedTrail(timestamp) {
      ctx.clearRect(0, 0, width, height);

      while (points.length > 0 && timestamp - points[0].time > maxAge) {
        points.shift();
      }

      if (points.length >= 2) {
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const age = timestamp - p1.time;
          const progress = Math.max(0, 1 - age / maxAge);

          const midX = (p0.x + p1.x) / 2;
          const midY = (p0.y + p1.y) / 2;

          // Vibrant Pink Sketch Line
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          ctx.strokeStyle = `rgba(255, 42, 109, ${progress * 0.75})`;
          ctx.lineWidth = Math.max(1.2, progress * 3.5);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // Charcoal Sketch Core
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          ctx.strokeStyle = `rgba(23, 17, 15, ${progress * 0.85})`;
          ctx.lineWidth = Math.max(0.8, progress * 1.6);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }

        requestAnimationFrame(renderCurvedTrail);
      } else {
        isDrawing = false;
        ctx.clearRect(0, 0, width, height);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPencilSystem);
  } else {
    initPencilSystem();
  }
})();
