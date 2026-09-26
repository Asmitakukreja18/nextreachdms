/**
 * NextReach DMS - Enterprise Agency JavaScript Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCalculator();
  initCounters();
  initModal();
  initMobileMenu();
  initCaseStudyFilter();
  initScrollReveal();
  initNavbarScroll();
  initCustomCursor();
  initMagneticButtons();
});

// 1. Theme Management (Light / Dark)
function initTheme() {
  const savedTheme = localStorage.getItem('nextreach_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtns = document.querySelectorAll('.theme-toggle-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('nextreach_theme', next);
      updateThemeIcon(next);
      showToast(`Switched to ${next === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}`);
    });
  });
}

function updateThemeIcon(theme) {
  const icons = document.querySelectorAll('.theme-toggle-btn');
  icons.forEach(btn => {
    btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  });
}

// 2. Interactive Dynamic ROI Calculator
function initCalculator() {
  const budgetInput = document.getElementById('calc-budget');
  const industrySelect = document.getElementById('calc-industry');
  const budgetValDisplay = document.getElementById('calc-budget-val');
  
  const leadsDisplay = document.getElementById('calc-leads');
  const roasDisplay = document.getElementById('calc-roas');
  const revDisplay = document.getElementById('calc-revenue');

  if (!budgetInput) return;

  const industryMultipliers = {
    'ecommerce': { roas: 4.6, cpl: 180 },
    'realestate': { roas: 6.2, cpl: 650 },
    'education': { roas: 3.8, cpl: 240 },
    'b2b': { roas: 5.0, cpl: 850 },
    'healthcare': { roas: 4.2, cpl: 320 }
  };

  function calculate() {
    const budget = parseInt(budgetInput.value, 10);
    const industry = industrySelect.value;
    const config = industryMultipliers[industry] || industryMultipliers['ecommerce'];

    budgetValDisplay.innerText = `₹${(budget / 1000).toLocaleString('en-IN')}K`;

    const estimatedLeads = Math.round(budget / config.cpl);
    const estimatedRev = Math.round(budget * config.roas);

    leadsDisplay.innerText = `${estimatedLeads.toLocaleString('en-IN')}+`;
    roasDisplay.innerText = `${config.roas}x`;
    revDisplay.innerText = `₹${(estimatedRev / 100000).toFixed(1)} Lakh`;
  }

  budgetInput.addEventListener('input', calculate);
  industrySelect.addEventListener('change', calculate);
  calculate();
}

// 3. Stats Counter Animation
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target') || el.innerText.replace(/[^0-9]/g, ''), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        
        let start = 0;
        const duration = 1500;
        const stepTime = Math.abs(Math.floor(duration / 40));
        
        const timer = setInterval(() => {
          start += Math.ceil(target / 40);
          if (start >= target) {
            el.innerText = `${prefix}${target}${suffix}`;
            clearInterval(timer);
          } else {
            el.innerText = `${prefix}${start}${suffix}`;
          }
        }, stepTime);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// 4. Modal & Lead Booking System
function initModal() {
  const modal = document.getElementById('consult-modal');
  const openBtns = document.querySelectorAll('.btn-open-modal');
  const closeBtn = document.querySelector('.modal-close');
  const form = document.getElementById('audit-form');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.style.display = 'flex';
      setTimeout(() => modal.classList.add('active'), 10);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]').value;
      const phone = form.querySelector('[name="phone"]').value;
      const service = form.querySelector('[name="service"]').value;

      modal.classList.remove('active');
      setTimeout(() => { modal.style.display = 'none'; }, 300);
      form.reset();

      showToast(`🎉 Thank you ${name}! Our Growth Strategist will call you at ${phone} regarding ${service}.`);
    });
  }
}

// 5. Case Study Filtering
function initCaseStudyFilter() {
  const filterBtns = document.querySelectorAll('.case-filter-btn');
  const cards = document.querySelectorAll('.case-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      cards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => { card.style.display = 'none'; }, 300);
        }
      });
    });
  });
}

// 6. Mobile Menu
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.nav-links');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      if (nav.style.display === 'flex') {
        nav.style.display = 'none';
      } else {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.top = '76px';
        nav.style.left = '0';
        nav.style.right = '0';
        nav.style.background = 'var(--bg-card)';
        nav.style.padding = '24px';
        nav.style.borderBottom = '1px solid var(--border-subtle)';
      }
    });
  }
}

// 7. Adwali-Inspired Hardware Accelerated Scroll Reveal System
function initScrollReveal() {
  const autoTargets = document.querySelectorAll('.section-title, .section-header, .service-card, .case-card, .feature-card, .pricing-card, .stat-item, .audit-card, .testimonial-card, .process-step-card, .leadership-card');
  autoTargets.forEach((el, idx) => {
    if (!el.classList.contains('nr-reveal')) {
      el.classList.add('nr-reveal');
      const delayClass = `delay-${((idx % 4) + 1) * 100}`;
      el.classList.add(delayClass);
    }
  });

  const reveals = document.querySelectorAll('.nr-reveal, .nr-reveal-fade-up, .nr-reveal-scale, .nr-reveal-left, .nr-reveal-right');
  if (!reveals.length) return;

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));
}

// 8. Glassmorphic Navbar Scroll Shrink
function initNavbarScroll() {
  const navbar = document.getElementById('mainNavbar') || document.querySelector('.header-nav');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// 9. Physics Lerped Custom Cursor Tracker
function initCustomCursor() {
  const dot = document.getElementById('cursorDot');
  const aura = document.getElementById('cursorAura');
  if (!dot || !aura) return;

  let mouseX = 0, mouseY = 0;
  let auraX = 0, auraY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  function renderCursor() {
    auraX += (mouseX - auraX) * 0.18;
    auraY += (mouseY - auraY) * 0.18;
    aura.style.left = `${auraX}px`;
    aura.style.top = `${auraY}px`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  const hoverableSelector = 'a, button, .btn, .btn-orange, .btn-navy-outline, .service-card, .case-card, .theme-toggle-btn';
  document.querySelectorAll(hoverableSelector).forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.classList.add('hovered');
      aura.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      dot.classList.remove('hovered');
      aura.classList.remove('hovered');
    });
  });
}

// 10. Magnetic Spring Button Physics & Interactive Confetti Feedback
function initMagneticButtons() {
  const magneticBtns = document.querySelectorAll('.btn-orange, .btn-navy-outline, .btn-hero, .btn-glow, .magnetic-btn');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.04)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });

    if (btn.classList.contains('btn-orange')) {
      btn.addEventListener('click', () => {
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 45,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#ff6b00', '#002d62', '#ff4500', '#ffffff']
          });
        }
      });
    }
  });
}

// 11. Global Toast Notification System
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

