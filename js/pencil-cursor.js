/**
 * NextReach DMS — Touch-Sensing Kawaii Orange Pencil Cursor & Trail
 * Reference: ChatGPT Image Sep 27, 2026, 02_22_14 AM (Orange pencil with blue cap, anime eyes, smile, blue tip)
 * Mobile Touch: Appears exactly where the user touches & scrolls, waving softly and drawing curves
 * Desktop Mouse: Smooth cursor tracking with gentle scroll waving
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

    // 2. Kawaii Orange Pencil Element
    let pencil = document.getElementById('handDrawnPencil');
    if (!pencil) {
      pencil = document.createElement('div');
      pencil.id = 'handDrawnPencil';
      pencil.setAttribute('aria-hidden', 'true');
      pencil.style.cssText = 'position:fixed;top:0;left:0;width:44px;height:64px;pointer-events:none;z-index:999999;transform:translate3d(-100px,-100px,0);filter:drop-shadow(2px 6px 12px rgba(255,107,0,0.35));will-change:transform;transition:opacity 0.22s ease, filter 0.15s ease;opacity:0;';
      pencil.innerHTML = `
        <img src="images/kawaii-orange-pencil.png" alt="Kawaii Orange Pencil" style="width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;display:block;">
      `;
      document.body.appendChild(pencil);
    }

    // Hide native cursor only on desktop when mouse is active
    let cursorStyle = document.getElementById('pencilCursorHideStyle');
    function enableDesktopCursor() {
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

    // 3. Coordinate & Trail Points
    const points = [];
    const maxPoints = 26;
    const maxAge = 500; // milliseconds
    let posX = -100, posY = -100;
    let isDrawing = false;
    let isHovering = false;
    let isMouseDown = false;
    let isTouching = false;
    let touchFadeTimer = null;

    // Scroll & Touch Wave Dynamics
    let waveVelocity = 0;
    let wavePhase = 0;
    let isWaving = false;
    let waveStopTimer = null;
    let lastScrollY = window.scrollY;

    // Pencil tip calibrated offset
    const TIP_X = 30;
    const TIP_Y = 62;

    function renderPencilPosition(extraX = 0, extraY = 0, extraAngle = 0) {
      if (posX < 0 || posY < 0) return;

      const scale = isMouseDown || isTouching ? 0.95 : (isHovering ? 1.14 : 1.0);
      const baseRot = isHovering ? -6 : 0;
      const totalRot = baseRot + extraAngle;

      // On touch, offset slightly upward (-12px) so the user's finger does not cover the cute pencil face
      const touchOffsetY = isTouching ? -14 : 0;

      pencil.style.transform = `translate3d(${posX - TIP_X + extraX}px, ${posY - TIP_Y + touchOffsetY + extraY}px, 0) scale(${scale}) rotate(${totalRot}deg)`;
    }

    // --- DESKTOP MOUSE INTERACTION ---
    window.addEventListener('mousemove', (e) => {
      if (isTouchDevice()) return;
      enableDesktopCursor();
      posX = e.clientX;
      posY = e.clientY;

      renderPencilPosition();

      points.push({
        x: posX,
        y: posY,
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
      if (!isTouchDevice()) pencil.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      if (!isTouchDevice()) pencil.style.opacity = '1';
    });

    document.addEventListener('mousedown', () => {
      if (isTouchDevice()) return;
      isMouseDown = true;
      renderPencilPosition(0, 2, -4);
    });

    document.addEventListener('mouseup', () => {
      if (isTouchDevice()) return;
      isMouseDown = false;
      renderPencilPosition();
    });

    const hoverSelectors = 'a, button, [role="button"], .btn, .btn-orange, .btn-visit-live, .project-card, .tilt-card, input, select, textarea, .theme-toggle-btn';
    document.addEventListener('mouseover', (e) => {
      if (isTouchDevice()) return;
      if (e.target.closest(hoverSelectors)) {
        isHovering = true;
        pencil.style.filter = 'drop-shadow(0 0 14px rgba(255, 107, 0, 0.85)) drop-shadow(2px 6px 10px rgba(0,45,98,0.4))';
        renderPencilPosition();
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      if (isTouchDevice()) return;
      if (e.target.closest(hoverSelectors)) {
        isHovering = false;
        pencil.style.filter = 'drop-shadow(2px 6px 12px rgba(255,107,0,0.35))';
        renderPencilPosition();
      }
    }, { passive: true });

    // --- MOBILE TOUCH SENSING (Pencil appears exactly where user touches/swipes) ---
    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        clearTimeout(touchFadeTimer);
        const touch = e.touches[0];
        posX = touch.clientX;
        posY = touch.clientY;
        isTouching = true;

        pencil.style.opacity = '1';
        renderPencilPosition(0, 0, 4);

        points.push({
          x: posX,
          y: posY,
          time: performance.now()
        });

        if (!isDrawing) {
          isDrawing = true;
          requestAnimationFrame(renderCurvedTrail);
        }
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        clearTimeout(touchFadeTimer);
        const touch = e.touches[0];
        const dx = touch.clientX - posX;
        const dy = touch.clientY - posY;
        posX = touch.clientX;
        posY = touch.clientY;
        isTouching = true;

        // Subtle dynamic tilt while dragging
        waveVelocity = Math.min(1.4, waveVelocity * 0.7 + Math.sqrt(dx * dx + dy * dy) * 0.04 + 0.2);
        wavePhase += 0.24;
        const touchWaveAngle = Math.sin(wavePhase) * (10 * waveVelocity);
        const touchWaveY = Math.cos(wavePhase) * (3 * waveVelocity);

        pencil.style.opacity = '1';
        renderPencilPosition(0, touchWaveY, touchWaveAngle);

        points.push({
          x: posX,
          y: posY,
          time: performance.now()
        });

        if (points.length > maxPoints) {
          points.shift();
        }

        if (!isDrawing) {
          isDrawing = true;
          requestAnimationFrame(renderCurvedTrail);
        }
      }
    }, { passive: true });

    function handleTouchRelease() {
      isTouching = false;
      clearTimeout(touchFadeTimer);
      // Smoothly fade out after brief pause so user can see what was drawn
      touchFadeTimer = setTimeout(() => {
        if (isTouchDevice() && !isTouching) {
          pencil.style.opacity = '0';
        }
      }, 450);
    }

    window.addEventListener('touchend', handleTouchRelease, { passive: true });
    window.addEventListener('touchcancel', handleTouchRelease, { passive: true });

    // --- 4. SCROLL PROGRESS & WAVE DYNAMICS ---
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY;
      const dy = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;

      // Update minimal progress bar
      const pBar = document.getElementById('scrollProgress');
      if (pBar) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPct = maxScroll > 0 ? (currentY / maxScroll) * 100 : 0;
        pBar.style.width = scrollPct + '%';
      }

      // Scroll wave dynamics for currently visible pencil
      if (posX > 0 && posY > 0) {
        waveVelocity = Math.min(1.5, waveVelocity * 0.78 + Math.min(dy, 45) * 0.04 + 0.3);
        isWaving = true;

        clearTimeout(waveStopTimer);
        waveStopTimer = setTimeout(() => {
          isWaving = false;
        }, 180);

        if (!isWaveAnimationRunning) {
          isWaveAnimationRunning = true;
          requestAnimationFrame(renderScrollWaveMotion);
        }
      }
    }, { passive: true });

    let isWaveAnimationRunning = false;
    function renderScrollWaveMotion() {
      if (isWaving) {
        wavePhase += 0.22;
      } else {
        waveVelocity *= 0.88;
        if (waveVelocity < 0.015) {
          waveVelocity = 0;
          isWaveAnimationRunning = false;
          renderPencilPosition(0, 0, 0);
          return;
        }
      }

      // Gentle, pleasant sinusoidal wave
      const waveAngle = Math.sin(wavePhase) * (11 * waveVelocity);
      const waveY = Math.cos(wavePhase * 0.9) * (4 * waveVelocity);
      const waveX = Math.sin(wavePhase * 0.7) * (3 * waveVelocity);

      renderPencilPosition(waveX, waveY, waveAngle);

      requestAnimationFrame(renderScrollWaveMotion);
    }

    // --- 5. CURVED CANVAS SKETCH TRAIL ---
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
