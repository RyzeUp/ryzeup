/* ============================================================
   RYZEUP — script.js
   ============================================================ */

/* ---------- Navbar scroll state ---------- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

/* ---------- Active nav link on scroll ---------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-50% 0px -50% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ---------- Mobile hamburger ---------- */
const hamburger = document.getElementById('hamburger');
const navList   = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navList.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close menu on link click
navList.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navList.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Animated counters ---------- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsGrid = document.querySelector('.stats-grid');
if (statsGrid) counterObserver.observe(statsGrid);

/* ---------- Contact form ---------- */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    // Simulate submission (replace with real fetch/API call)
    setTimeout(() => {
      form.innerHTML = `
        <div class="form-success">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#DA0037" stroke-width="2" width="56" height="56" style="margin:0 auto 20px">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
          <h3>Message Sent!</h3>
          <p>Thanks for reaching out. We'll be in touch within 24 hours.</p>
        </div>
      `;
    }, 1200);
  });
}

/* ---------- Smooth scroll for all anchor links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = navbar.offsetHeight;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
