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
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]').value;
      const phone = form.querySelector('[name="phone"]').value;
      const service = form.querySelector('[name="service"]').value;

      modal.style.display = 'none';
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
        } else {
          card.style.display = 'none';
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

// 7. Global Toast Notification System
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
