/* ============================================================
   FLOWRIGHT PLUMBING & HEATING — script.js
   ============================================================ */

/* ---- Hero background lazy load ---- */
const heroSection = document.querySelector('.hero');
if (heroSection) {
  const bg  = heroSection.querySelector('.hero-bg');
  const src = heroSection.dataset.bg;
  if (bg && src) {
    const img = new Image();
    img.onload = () => { bg.style.backgroundImage = `url('${src}')`; };
    img.src = src;
  }
}

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

navLinks.querySelectorAll('.nav-link, .nav-phone-mobile').forEach(link => {
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
    const id     = anchor.getAttribute('href');
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

/* ---- Scroll reveal (opacity only — snappy, no translate) ---- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.07 });

document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));

/* ---- Gallery lightbox with captions ---- */
const galleryItems    = Array.from(document.querySelectorAll('.gallery-item'));
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxPrev    = document.getElementById('lightboxPrev');
const lightboxNext    = document.getElementById('lightboxNext');

const srcs     = galleryItems.map(item => item.dataset.src);
const captions = galleryItems.map(item => item.dataset.caption || '');
let currentIndex = 0;

function openLightbox(index) {
  currentIndex        = index;
  lightboxImg.src     = srcs[currentIndex];
  lightboxImg.alt     = captions[currentIndex];
  lightboxCaption.textContent = captions[currentIndex];
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
  currentIndex = (index + galleryItems.length) % galleryItems.length;
  lightboxImg.src = srcs[currentIndex];
  lightboxImg.alt = captions[currentIndex];
  lightboxCaption.textContent = captions[currentIndex];
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

/* ---- Contact form — Formspree fetch submission ---- */
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
