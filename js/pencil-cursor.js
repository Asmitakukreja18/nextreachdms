/**
 * Cute Hand-Drawn Pencil Cursor with Smooth Curved Sketch Trail
 * NextReach DMS & Marketiqx
 */
(function () {
  'use strict';

  // Only run on mouse devices (not mobile / touch)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  function initPencilCursor() {
    // Prevent duplicate initialization
    if (document.getElementById('cutePencilCursor')) return;

    // 1. Create Trail Canvas
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

    // 2. Create Cute Pencil Cursor Element
    const pencil = document.createElement('div');
    pencil.id = 'cutePencilCursor';
    pencil.className = 'cute-pencil-cursor';
    pencil.setAttribute('aria-hidden', 'true');
    pencil.innerHTML = `
      <div class="pencil-anchor">
        <svg viewBox="0 0 48 48" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg" class="cute-pencil-svg">
          <!-- Drop Shadow under pencil -->
          <ellipse cx="24" cy="24" rx="14" ry="5" transform="rotate(-30 24 24)" fill="rgba(0, 23, 54, 0.18)" />

          <!-- 1. Sharp Graphite Tip (Points at 0,0) -->
          <polygon points="0,0 8,3 3,8" fill="#1A1D20" />

          <!-- 2. Sharpened Wood Neck -->
          <polygon points="8,3 16,6 6,16 3,8" fill="#FDE68A" stroke="#1A1D20" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M 3 8 Q 6 6 8 3" fill="none" stroke="#D97706" stroke-width="1.3" />

          <!-- 3. Cute Yellow Pencil Body -->
          <polygon points="16,6 31,21 21,31 6,16" fill="#FFB703" stroke="#1A1D20" stroke-width="1.8" stroke-linejoin="round" />
          <!-- Shading Facet -->
          <polygon points="11,11 26,26 21,31 6,16" fill="#FB8500" opacity="0.32" />
          <line x1="16" y1="6" x2="31" y2="21" stroke="#FFE600" stroke-width="1.5" stroke-linecap="round" />
          <line x1="8.5" y1="13.5" x2="23.5" y2="28.5" stroke="#FFA200" stroke-width="1.5" stroke-linecap="round" />

          <!-- 4. Kawaii Cute Eyes & Smile -->
          <!-- Left Eye -->
          <circle cx="16.5" cy="18.5" r="1.4" fill="#1A1D20" />
          <circle cx="16" cy="18" r="0.5" fill="#FFFFFF" />
          <!-- Right Eye -->
          <circle cx="20.5" cy="14.5" r="1.4" fill="#1A1D20" />
          <circle cx="20" cy="14" r="0.5" fill="#FFFFFF" />
          <!-- Tiny Smile -->
          <path d="M 17.8 17.2 Q 19 18.5 20.2 16.8" fill="none" stroke="#1A1D20" stroke-width="1.2" stroke-linecap="round" />
          <!-- Blushing Cheeks -->
          <ellipse cx="14.8" cy="19.5" rx="1.2" ry="0.8" fill="#FF477E" opacity="0.8" />
          <ellipse cx="21.8" cy="13.8" rx="1.2" ry="0.8" fill="#FF477E" opacity="0.8" />

          <!-- 5. Shiny Silver Ferrule -->
          <polygon points="31,21 35,25 25,35 21,31" fill="#E2E8F0" stroke="#1A1D20" stroke-width="1.6" stroke-linejoin="round" />
          <line x1="29.5" y1="23.5" x2="23.5" y2="29.5" stroke="#94A3B8" stroke-width="1.3" />
          <line x1="32.5" y1="26.5" x2="26.5" y2="32.5" stroke="#CBD5E1" stroke-width="1" />

          <!-- 6. Cute Pink Eraser -->
          <path d="M 35 25 L 38 28 C 41.5 31.5 41.5 35.5 38 39 C 34.5 42.5 30.5 42.5 27 39 L 25 35 Z" 
                fill="#FF758F" stroke="#1A1D20" stroke-width="1.8" stroke-linejoin="round" />
          <ellipse cx="34" cy="34" rx="4" ry="2" transform="rotate(-45 34 34)" fill="#FFAAB8" opacity="0.6" />
        </svg>
      </div>
    `;
    document.body.appendChild(pencil);
    document.body.classList.add('cute-pencil-enabled');

    // 3. Trail Points & Rendering
    const points = [];
    const maxPoints = 28;
    const maxAge = 580; // milliseconds
    let mouseX = -100, mouseY = -100;
    let isDrawingLoopActive = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Position pencil tip directly at mouse coordinates
      pencil.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      if (!pencil.classList.contains('active')) {
        pencil.classList.add('active');
      }

      // Add point for curved line trail
      points.push({
        x: mouseX,
        y: mouseY,
        time: performance.now()
      });

      if (points.length > maxPoints) {
        points.shift();
      }

      if (!isDrawingLoopActive) {
        isDrawingLoopActive = true;
        requestAnimationFrame(renderCurvedTrail);
      }
    }, { passive: true });

    // Press down effect on mouse click
    window.addEventListener('mousedown', () => {
      pencil.classList.add('pencil-pressing');
    });
    window.addEventListener('mouseup', () => {
      pencil.classList.remove('pencil-pressing');
    });

    // Hover effect over buttons, links, cards
    const hoverQuery = 'a, button, .btn, .btn-orange, .btn-visit-live, .project-card, .tilt-card, input, select, textarea, [role="button"], .theme-toggle-btn';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverQuery)) {
        pencil.classList.add('pencil-hover');
      }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverQuery)) {
        pencil.classList.remove('pencil-hover');
      }
    }, { passive: true });

    // Render Smooth Curved Pencil Trail
    function renderCurvedTrail(timestamp) {
      ctx.clearRect(0, 0, width, height);

      // Remove points older than maxAge
      while (points.length > 0 && timestamp - points[0].time > maxAge) {
        points.shift();
      }

      if (points.length >= 2) {
        // Draw smooth curved segments through midpoints
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const age = timestamp - p1.time;
          const progress = Math.max(0, 1 - age / maxAge);

          const midX = (p0.x + p1.x) / 2;
          const midY = (p0.y + p1.y) / 2;

          // Outer orange pencil lead glow
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          ctx.strokeStyle = `rgba(255, 107, 0, ${progress * 0.75})`;
          ctx.lineWidth = Math.max(1, progress * 3.4);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();

          // Inner dark graphite sketch core
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          ctx.strokeStyle = `rgba(26, 29, 32, ${progress * 0.85})`;
          ctx.lineWidth = Math.max(0.7, progress * 1.8);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }

        requestAnimationFrame(renderCurvedTrail);
      } else {
        isDrawingLoopActive = false;
        ctx.clearRect(0, 0, width, height);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPencilCursor);
  } else {
    initPencilCursor();
  }
})();
