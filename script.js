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


/* ---------- Contact form ---------- */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
      const res = await fetch('https://formspree.io/f/xaqkaedk', {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
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
      } else {
        btn.textContent = 'Send Enquiry →';
        btn.disabled = false;
        alert('Something went wrong. Please try again or email us directly at david@ryzeup.co.uk');
      }
    } catch {
      btn.textContent = 'Send Enquiry →';
      btn.disabled = false;
      alert('Something went wrong. Please try again or email us directly at david@ryzeup.co.uk');
    }
  });
}

/* ---------- Free mockup form ---------- */
// Replace REPLACE_WITH_MY_NEW_ID with the ID of the "Free Mockup Requests" form in Formspree
const MOCKUP_ENDPOINT = 'https://formspree.io/f/REPLACE_WITH_MY_NEW_ID';

const mockupForm = document.getElementById('mockupForm');
if (mockupForm) {
  const status = document.getElementById('mockupStatus');
  const submitBtn = mockupForm.querySelector('button[type="submit"]');
  const btnLabel = submitBtn.textContent;

  const messages = {
    'mk-name': 'Please enter your name.',
    'mk-business': 'Please enter your business name.',
    'mk-what': 'Tell us briefly what your business does.',
    'mk-town': 'Please enter your town or area.',
    'mk-email': 'Please enter a valid email address.',
    'mk-website': 'Please enter a full web address, e.g. https://example.co.uk'
  };

  const clearError = (field) => {
    const group = field.closest('.form-group');
    group.classList.remove('has-error');
    field.removeAttribute('aria-invalid');
    const err = group.querySelector('.field-error');
    if (err) err.remove();
  };

  const showError = (field) => {
    const group = field.closest('.form-group');
    if (group.querySelector('.field-error')) return;
    group.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');
    const err = document.createElement('span');
    err.className = 'field-error';
    err.id = `${field.id}-error`;
    err.textContent = messages[field.id] || 'Please check this field.';
    field.setAttribute('aria-describedby', err.id);
    group.appendChild(err);
  };

  const fields = mockupForm.querySelectorAll('.form-group input, .form-group textarea');
  fields.forEach(f => f.addEventListener('input', () => clearError(f)));

  mockupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';

    let firstInvalid = null;
    fields.forEach(f => {
      clearError(f);
      if (f.value.trim() === '' && !f.required) return;
      if (!f.checkValidity() || (f.required && f.value.trim() === '')) {
        showError(f);
        if (!firstInvalid) firstInvalid = f;
      }
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      const res = await fetch(MOCKUP_ENDPOINT, {
        method: 'POST',
        body: new FormData(mockupForm),
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error('Request failed');

      mockupForm.innerHTML = `
        <div class="form-success" role="status" aria-live="polite">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#DA0037" stroke-width="2" width="56" height="56" style="margin:0 auto 20px" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
          <h3>Thanks! We've got your request.</h3>
          <p>Your free mockup will be with you within 48 hours — keep an eye on your inbox.</p>
        </div>
      `;
    } catch {
      submitBtn.textContent = btnLabel;
      submitBtn.disabled = false;
      status.textContent = 'Something went wrong — please try again or email hello@ryzeup.co.uk';
    }
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
