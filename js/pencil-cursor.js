/**
 * NextReach DMS — Kawaii Orange Pencil Cursor with Scroll-Linked Waving Motion
 * Reference: ChatGPT Image Sep 27, 2026, 02_22_14 AM (Orange pencil with blue cap, anime eyes, smile, blue tip)
 */
(function () {
  'use strict';

  function initPencilSystem() {
    if (window._pencilSystemInitialized) return;
    window._pencilSystemInitialized = true;

    const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 992;

    // 1. Overlay Canvas for Smooth Curved Sketch Trail
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

    // 2. Kawaii Orange Pencil Cursor Element
    let pencil = document.getElementById('handDrawnPencil');
    if (!pencil) {
      pencil = document.createElement('div');
      pencil.id = 'handDrawnPencil';
      pencil.setAttribute('aria-hidden', 'true');
      pencil.style.cssText = 'position:fixed;top:0;left:0;width:46px;height:66px;pointer-events:none;z-index:999999;transform:translate3d(-100px,-100px,0);filter:drop-shadow(2px 6px 12px rgba(255,107,0,0.35));will-change:transform;transition:opacity 0.2s ease, filter 0.15s ease;opacity:0;';
      pencil.innerHTML = `
        <img src="images/kawaii-orange-pencil.png" alt="Kawaii Orange Pencil" style="width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;display:block;">
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

    // 3. Mouse Tracking & Coordinates
    const points = [];
    const maxPoints = 26;
    const maxAge = 500; // milliseconds
    let mouseX = -100, mouseY = -100;
    let isDrawing = false;
    let isHovering = false;
    let isMouseDown = false;

    // Scroll Wave Physics
    let scrollVelocity = 0;
    let wavePhase = 0;
    let isScrolling = false;
    let scrollStopTimer = null;
    let lastScrollY = window.scrollY;
    let isWaveAnimationRunning = false;

    // Tip coordinates for 46x66px display
    const TIP_X = 31;
    const TIP_Y = 64;

    function updatePencilPosition(waveX = 0, waveY = 0, waveAngle = 0) {
      if (isTouchDevice()) {
        pencil.style.opacity = '0';
        return;
      }
      if (mouseX < 0 || mouseY < 0) return;

      const scale = isMouseDown ? 0.92 : (isHovering ? 1.15 : 1);
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

    // 4. Scroll Wave Motion ("pencil should wave like small waves")
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      const dy = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;

      // Update minimal progress bar if exists
      const pBar = document.getElementById('scrollProgress');
      if (pBar) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPct = maxScroll > 0 ? (currentY / maxScroll) * 100 : 0;
        pBar.style.width = scrollPct + '%';
      }

      if (isTouchDevice()) return;

      scrollVelocity = Math.min(1.5, scrollVelocity * 0.75 + Math.min(dy, 40) * 0.04 + 0.35);
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
        wavePhase += 0.22; // Small pleasant wave frequency
      } else {
        scrollVelocity *= 0.86;
        if (scrollVelocity < 0.015) {
          scrollVelocity = 0;
          isWaveAnimationRunning = false;
          updatePencilPosition(0, 0, 0);
          return;
        }
      }

      // Small wave oscillations
      const waveAngle = Math.sin(wavePhase) * (12 * scrollVelocity); // tilt wave: ±12 deg
      const waveY = Math.cos(wavePhase * 0.8) * (4 * scrollVelocity); // small vertical wave: ±4px
      const waveX = Math.sin(wavePhase * 0.6) * (3 * scrollVelocity); // small lateral sway: ±3px

      updatePencilPosition(waveX, waveY, waveAngle);

      requestAnimationFrame(renderScrollWaveMotion);
    }

    // 5. Curved Canvas Trail (Brand Navy & Orange Spline)
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

          // Orange glow line
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          ctx.strokeStyle = `rgba(255, 107, 0, ${progress * 0.75})`;
          ctx.lineWidth = Math.max(1.2, progress * 3.2);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // Navy ink core
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          ctx.strokeStyle = `rgba(0, 45, 98, ${progress * 0.85})`;
          ctx.lineWidth = Math.max(0.8, progress * 1.5);
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
