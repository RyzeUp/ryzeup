/* ============================================================
   VÉRITÉ STUDIO — script.js  (v2 redesign)
   ============================================================ */

/* ---- Navbar scroll state ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ---- Hamburger / mobile nav ---- */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  navLinks.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('.nav-link, .nav-book').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ---- Smooth scroll (offset for sticky nav) ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const offset = navbar.offsetHeight + 8;
    window.scrollTo({
      top:      target.getBoundingClientRect().top + window.scrollY - offset,
      behavior: 'smooth',
    });
  });
});

/* ---- Scroll reveal (opacity only) ---- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.07 });

document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));

/* ---- Before / After drag sliders ---- */
const baPairs = Array.from(document.querySelectorAll('.ba-pair'));
let activePair = null;

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

function getPosFromClientX(pair, clientX) {
  const rect = pair.getBoundingClientRect();
  return clamp((clientX - rect.left) / rect.width, 0.02, 0.98);
}

function setSliderPos(pair, pos) {
  pair.style.setProperty('--pos', `${(pos * 100).toFixed(1)}%`);
}

/* Hint animation: briefly drag to 30% and back to show it's interactive */
function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

function runHint(pair) {
  const duration = 800;
  const start    = performance.now();

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const pos = t < 0.5
      ? 0.5 + (0.3 - 0.5) * easeInOut(t * 2)
      : 0.3 + (0.5 - 0.3) * easeInOut((t - 0.5) * 2);
    setSliderPos(pair, pos);
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

const hintedPairs = new WeakSet();

const baVisObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !hintedPairs.has(entry.target)) {
      hintedPairs.add(entry.target);
      const idx = baPairs.indexOf(entry.target);
      setTimeout(() => runHint(entry.target), 400 + idx * 180);
      baVisObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.45 });

baPairs.forEach(pair => {
  baVisObserver.observe(pair);

  pair.addEventListener('mousedown', e => {
    activePair = pair;
    setSliderPos(pair, getPosFromClientX(pair, e.clientX));
    e.preventDefault();
  });

  pair.addEventListener('touchstart', e => {
    activePair = pair;
    setSliderPos(pair, getPosFromClientX(pair, e.touches[0].clientX));
  }, { passive: true });
});

window.addEventListener('mousemove', e => {
  if (!activePair) return;
  setSliderPos(activePair, getPosFromClientX(activePair, e.clientX));
});

window.addEventListener('touchmove', e => {
  if (!activePair) return;
  setSliderPos(activePair, getPosFromClientX(activePair, e.touches[0].clientX));
}, { passive: true });

window.addEventListener('mouseup',  () => { activePair = null; });
window.addEventListener('touchend', () => { activePair = null; });

/* ---- Sticky Book Now ---- */
const bookSticky = document.getElementById('bookSticky');
const heroEl     = document.querySelector('.hero');
const contactEl  = document.getElementById('contact');

if (bookSticky && heroEl) {
  const stickyObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target === heroEl) {
        bookSticky.classList.toggle('visible', !entry.isIntersecting);
      }
      if (entry.target === contactEl && entry.isIntersecting) {
        bookSticky.classList.remove('visible');
      }
    });
  }, { threshold: 0.1 });

  stickyObs.observe(heroEl);
  if (contactEl) stickyObs.observe(contactEl);
}

/* ---- Gallery lightbox ---- */
const galleryItems  = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');

const srcs = galleryItems.map(item => item.dataset.src);
let currentIndex = 0;

function openLightbox(index) {
  currentIndex    = index;
  lightboxImg.src = srcs[currentIndex];
  lightboxImg.alt = `Portfolio shot ${currentIndex + 1}`;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

function showImage(index) {
  currentIndex    = (index + galleryItems.length) % galleryItems.length;
  lightboxImg.src = srcs[currentIndex];
  lightboxImg.alt = `Portfolio shot ${currentIndex + 1}`;
}

galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click',  () => showImage(currentIndex - 1));
lightboxNext.addEventListener('click',  () => showImage(currentIndex + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showImage(currentIndex - 1);
  if (e.key === 'ArrowRight') showImage(currentIndex + 1);
});

/* ---- Contact form — Formspree fetch ---- */
const contactForm = document.getElementById('contactForm');
const formSubmit  = document.getElementById('formSubmit');
const formSuccess = document.getElementById('formSuccess');
const formError   = document.getElementById('formError');

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    formSubmit.classList.add('loading');
    formSuccess.hidden = true;
    formError.hidden   = true;

    try {
      const response = await fetch(contactForm.action, {
        method:  'POST',
        headers: { Accept: 'application/json' },
        body:    new FormData(contactForm),
      });
      if (response.ok) {
        formSuccess.hidden = false;
        contactForm.reset();
      } else {
        formError.hidden = false;
      }
    } catch {
      formError.hidden = false;
    } finally {
      formSubmit.classList.remove('loading');
    }
  });
}
