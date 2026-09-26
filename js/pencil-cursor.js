/**
 * NextReach DMS — Kawaii Navy Pencil Character & Scroll Waving Engine
 * Reference: ChatGPT Image Sep 27, 2026 (Navy blue pencil with kawaii eyes, smile, orange cap, waving hands)
 */
(function () {
  'use strict';

  function initPencilSystem() {
    if (window._pencilSystemInitialized) return;
    window._pencilSystemInitialized = true;

    const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 992;

    // =========================================================================
    // 1. TOP RESPONSIVE PROGRESS TRACK WITH KAWAII PENCIL RIDER
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
            <img src="images/kawaii-navy-pencil.png" alt="Waving Pencil Rider" class="rider-pencil-img">
          </div>
        </div>
        <div class="scroll-track-arrow">►</div>
      `;
      document.body.prepend(progressTrack);
    }

    const progressBar = document.getElementById('scrollProgress');
    const pencilRider = document.getElementById('scrollPencilRider');

    // =========================================================================
    // 2. DESKTOP KAWAII PENCIL CURSOR & REAL-TIME CURVED CANVAS TRAIL
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
      pencil.style.cssText = 'position:fixed;top:0;left:0;width:44px;height:68px;pointer-events:none;z-index:999999;transform:translate3d(-100px,-100px,0);filter:drop-shadow(2px 6px 10px rgba(0,45,98,0.3));will-change:transform;transition:opacity 0.2s ease, filter 0.15s ease;opacity:0;';
      pencil.innerHTML = `
        <img src="images/kawaii-navy-pencil.png" alt="Kawaii Navy Pencil" style="width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;display:block;">
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
    const maxPoints = 28;
    const maxAge = 550; // milliseconds
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

    // Lead tip offset (44x68 box -> tip at 30, 67)
    const TIP_X = 30;
    const TIP_Y = 67;

    function updatePencilPosition(waveX = 0, waveY = 0, waveAngle = 0) {
      if (isTouchDevice()) {
        pencil.style.opacity = '0';
        return;
      }
      if (mouseX < 0 || mouseY < 0) return;

      const scale = isMouseDown ? 0.92 : (isHovering ? 1.16 : 1);
      const baseRot = isHovering ? -6 : 0;
      const totalRot = baseRot + waveAngle;

      pencil.style.transform = `translate3d(${mouseX - TIP_X + waveX}px, ${mouseY - TIP_Y + waveY}px, 0) scale(${scale}) rotate(${totalRot}deg)`;
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
      updatePencilPosition(0, 2, -4);
    });

    document.addEventListener('mouseup', () => {
      isMouseDown = false;
      updatePencilPosition();
    });

    const hoverSelectors = 'a, button, [role="button"], .btn, .btn-orange, .btn-visit-live, .project-card, .tilt-card, input, select, textarea, .theme-toggle-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSelectors)) {
        isHovering = true;
        pencil.style.filter = 'drop-shadow(0 0 14px rgba(255, 107, 0, 0.85)) drop-shadow(2px 6px 10px rgba(0,45,98,0.4))';
        updatePencilPosition();
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSelectors)) {
        isHovering = false;
        pencil.style.filter = 'drop-shadow(2px 6px 10px rgba(0,45,98,0.3))';
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

      clearTimeout(scrollStopTimer);
      scrollStopTimer = setTimeout(() => {
        isScrolling = false;
      }, 140);

      if (!isWaveAnimationRunning) {
        isWaveAnimationRunning = true;
        requestAnimationFrame(renderScrollWaveMotion);
      }
    }, { passive: true });

    function renderScrollWaveMotion() {
      if (isScrolling) {
        wavePhase += 0.24; // Small playful wave frequency
      } else {
        // Natural gentle spring dampening
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

      // Cute small wave calculations
      const waveAngle = Math.sin(wavePhase) * (14 * scrollVelocity); // Tilt wave: ±14 deg
      const waveY = Math.cos(wavePhase * 0.8) * (5 * scrollVelocity); // Vertical wave: ±5px
      const waveX = Math.sin(wavePhase * 0.6) * (3 * scrollVelocity); // Lateral sway: ±3px

      // 1. Apply waving motion to desktop cursor pencil
      updatePencilPosition(waveX, waveY, waveAngle);

      // 2. Apply waving motion to top rider pencil (both mobile and desktop)
      if (pencilRider) {
        const riderY = Math.sin(wavePhase * 1.2) * (5 * Math.min(1, scrollVelocity));
        const riderRot = Math.sin(wavePhase) * (14 * Math.min(1, scrollVelocity));
        pencilRider.style.transform = `translateY(${riderY}px) rotate(${riderRot}deg)`;
        pencilRider.classList.add('pencil-waving');
      }

      // 3. Add wave sketch trail points while scrolling
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
    // 5. SMOOTH CURVED TRAIL RENDERING (Brand Navy & Orange Spline)
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

          // 1. Vibrant Orange Glow Line (matches pencil eraser)
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          ctx.strokeStyle = `rgba(255, 107, 0, ${progress * 0.75})`;
          ctx.lineWidth = Math.max(1.2, progress * 3.4);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // 2. Royal Navy Ink Core (matches pencil body)
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          ctx.strokeStyle = `rgba(0, 45, 98, ${progress * 0.85})`;
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
