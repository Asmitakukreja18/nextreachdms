/**
 * Exact Reference Hand-Drawn Pencil Cursor with Smooth Curved Sketch Trail
 * Designed for NextReach DMS
 * Reference: Hand-drawn pencil with pink lead tip, white body segments, yellow eraser
 */
(function () {
  'use strict';

  function initPencilSystem() {
    // Prevent duplicate initializations
    if (window._pencilSystemInitialized) return;
    window._pencilSystemInitialized = true;

    // 1. Inject Canvas for Hand-Drawn Smooth Curved Line Trail
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

    function updateSize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', updateSize, { passive: true });

    // 2. Inject or Reference Exact Hand-Drawn Pencil Cursor Element
    let pencil = document.getElementById('handDrawnPencil');
    if (!pencil) {
      pencil = document.createElement('div');
      pencil.id = 'handDrawnPencil';
      pencil.setAttribute('aria-hidden', 'true');
      pencil.style.cssText = 'position:fixed;top:0;left:0;width:48px;height:48px;pointer-events:none;z-index:999999;transform:translate3d(-100px,-100px,0);filter:drop-shadow(2px 4px 6px rgba(23,17,15,0.25));will-change:transform;transition:opacity 0.2s ease, filter 0.15s ease;opacity:0;';
      pencil.innerHTML = `
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Subtle Pencil Shadow -->
          <path d="M 8 36 L 27 17 L 33 23 L 14 42 Z" fill="rgba(23, 17, 15, 0.18)" />

          <!-- 1. Back Yellow Eraser Cap -->
          <polygon points="8,34 13,29 19,35 14,40" fill="#FFB800" stroke="#17110F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>

          <!-- 2. White Barrel Body -->
          <polygon points="13,29 27,15 33,21 19,35" fill="#FFFFFF" stroke="#17110F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
          <!-- Two Dividing Section Lines -->
          <line x1="17.7" y1="24.3" x2="23.7" y2="30.3" stroke="#17110F" stroke-width="1.8" stroke-linecap="round"/>
          <line x1="22.3" y1="19.7" x2="28.3" y2="25.7" stroke="#17110F" stroke-width="1.8" stroke-linecap="round"/>
          <!-- Middle Accent Mark -->
          <circle cx="21" cy="25" r="1.4" fill="#17110F" opacity="0.65"/>

          <!-- 3. Sharpened Wood Section -->
          <polygon points="27,15 36,9.6 38.4,12 33,21" fill="#FFFFFF" stroke="#17110F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>

          <!-- 4. Hot Pink Lead Tip (Pointing at 42, 6) -->
          <polygon points="36,9.6 42,6 38.4,12" fill="#FF2A6D" stroke="#17110F" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        </svg>
      `;
      document.body.appendChild(pencil);
    }

    // 3. Hide OS Cursor only when mouse is active and on desktop/laptop
    let cursorStyle = document.getElementById('pencilCursorHideStyle');
    function enablePencilCursor() {
      if (!cursorStyle) {
        cursorStyle = document.createElement('style');
        cursorStyle.id = 'pencilCursorHideStyle';
        cursorStyle.textContent = `
          @media (hover: hover) and (pointer: fine), (min-width: 992px) {
            *, html, body, a, button, input, select, textarea, [role="button"] {
              cursor: none !important;
            }
          }
        `;
        document.head.appendChild(cursorStyle);
      }
      pencil.style.opacity = '1';
    }

    // 4. Smooth Curved Trail Architecture
    const points = [];
    const maxPoints = 28;
    const maxAge = 550; // milliseconds line stays on screen
    let mouseX = -100, mouseY = -100;
    let isDrawing = false;
    let isHovering = false;

    window.addEventListener('mousemove', (e) => {
      enablePencilCursor();
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Position pencil so the pink tip at (42, 6) aligns EXACTLY with mouse cursor
      const scale = isHovering ? 1.15 : 1;
      const rot = isHovering ? '-6deg' : '0deg';
      pencil.style.transform = `translate3d(${mouseX - 42}px, ${mouseY - 6}px, 0) scale(${scale}) rotate(${rot})`;

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
      pencil.style.opacity = '1';
    });

    // Click press animation (pencil writes down slightly)
    document.addEventListener('mousedown', () => {
      pencil.style.transform = `translate3d(${mouseX - 42}px, ${mouseY - 4}px, 0) scale(0.92) rotate(-3deg)`;
    });
    document.addEventListener('mouseup', () => {
      const scale = isHovering ? 1.15 : 1;
      const rot = isHovering ? '-6deg' : '0deg';
      pencil.style.transform = `translate3d(${mouseX - 42}px, ${mouseY - 6}px, 0) scale(${scale}) rotate(${rot})`;
    });

    // Interactive Hover Effects on buttons, links, cards
    const hoverSelectors = 'a, button, [role="button"], .btn, .btn-orange, .btn-visit-live, .project-card, .tilt-card, input, select, textarea, .theme-toggle-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSelectors)) {
        isHovering = true;
        pencil.style.filter = 'drop-shadow(0 0 10px rgba(255, 42, 109, 0.8)) drop-shadow(2px 4px 6px rgba(23,17,15,0.3))';
        pencil.style.transform = `translate3d(${mouseX - 42}px, ${mouseY - 6}px, 0) scale(1.15) rotate(-6deg)`;
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSelectors)) {
        isHovering = false;
        pencil.style.filter = 'drop-shadow(2px 4px 6px rgba(23,17,15,0.25))';
        pencil.style.transform = `translate3d(${mouseX - 42}px, ${mouseY - 6}px, 0) scale(1) rotate(0deg)`;
      }
    }, { passive: true });

    // 5. Draw Smooth Curved Sketch Line with Quadratic Spline
    function renderCurvedTrail(timestamp) {
      ctx.clearRect(0, 0, width, height);

      // Remove points older than maxAge
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

          // 1. Vibrant Pink Sketch Trail (Matches Pink Tip)
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          ctx.strokeStyle = `rgba(255, 42, 109, ${progress * 0.75})`;
          ctx.lineWidth = Math.max(1.2, progress * 3.5);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // 2. Fine Charcoal Hand-Drawn Core
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
