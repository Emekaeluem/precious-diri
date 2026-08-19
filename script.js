/* ==========================================================================
   PRECIOUS MCESHIET DIRI — Site Interactivity
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Nav: scrolled state ---------------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- Mobile nav toggle ---------------- */
  const toggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.nav__mobile');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------- Active nav link (scrollspy for anchors) ---------------- */
  const navLinks = document.querySelectorAll('.nav__links a[href*="#"], .nav__mobile a[href*="#"]');
  const anchorSections = ['home', 'about', 'contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (anchorSections.length && navLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const matches = link.getAttribute('href') === `#${id}` || link.getAttribute('href') === `index.html#${id}`;
            link.classList.toggle('is-active', matches);
          });
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    anchorSections.forEach(sec => spy.observe(sec));
  }

  /* ---------------- Hero load-in ---------------- */
  const hero = document.querySelector('.hero');
  if (hero) {
    // wrap each word of the headline for a reveal animation
    const heading = hero.querySelector('h1');
    if (heading && !heading.dataset.wrapped) {
      const words = heading.textContent.trim().split(/\s+/);
      heading.innerHTML = words
        .map(w => `<span class="word"><span>${w}</span></span>`)
        .join(' ');
      heading.dataset.wrapped = 'true';
    }
    requestAnimationFrame(() => {
      setTimeout(() => hero.classList.add('is-loaded'), 120);
    });
  }

  /* ---------------- Generic scroll reveal ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (prefersReducedMotion) {
      revealEls.forEach(el => el.classList.add('is-visible'));
    } else {
      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
      revealEls.forEach(el => revealObserver.observe(el));
    }
  }

  /* ---------------- Purpose Thread: progress + node scrollspy ---------------- */
  const thread = document.querySelector('.thread');
  if (thread) {
    const track = thread.querySelector('.thread__track');
    const nodes = Array.from(thread.querySelectorAll('.thread__node'));
    const journeyEls = nodes
      .map(n => document.getElementById(n.dataset.target))
      .filter(Boolean);

    const updateProgress = () => {
      const docEl = document.documentElement;
      const scrollTop = window.scrollY;
      const scrollHeight = docEl.scrollHeight - window.innerHeight;
      const pct = scrollHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)) : 0;
      track.style.setProperty('--thread-progress', pct + '%');
      track.querySelector('.thread__fill') && (track.querySelector('.thread__fill').style.height = pct + '%');
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);

    if (journeyEls.length) {
      const nodeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const idx = journeyEls.indexOf(entry.target);
          if (idx === -1) return;
          if (entry.isIntersecting) {
            nodes[idx].classList.add('is-lit');
          }
        });
      }, { rootMargin: '-40% 0px -40% 0px' });
      journeyEls.forEach(el => nodeObserver.observe(el));
    }
  }

  /* ---------------- Venture videos: play + sound on scroll into view ---------------- */
  const ventureFrames = document.querySelectorAll('.venture__frame');
  if (ventureFrames.length) {
    ventureFrames.forEach(frame => {
      const video = frame.querySelector('video');
      const soundPill = frame.querySelector('.venture__sound');
      if (!video) return;

      video.muted = true; // start muted so autoplay is always allowed
      video.playsInline = true;

      const attemptSound = () => {
        video.muted = false;
        const p = video.play();
        if (p && p.catch) {
          p.catch(() => {
            // Browser blocked audio autoplay — fall back to muted playback
            video.muted = true;
            video.play().catch(() => {});
            if (soundPill) soundPill.classList.add('is-muted');
          });
        }
        if (soundPill) soundPill.classList.remove('is-muted');
      };

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            frame.classList.add('is-playing');
            attemptSound();
          } else {
            frame.classList.remove('is-playing');
            video.pause();
            video.muted = true;
            video.currentTime = 0;
          }
        });
      }, { threshold: [0, 0.55, 1] });
      io.observe(frame);

      // Tap the sound pill to retry unmuted playback (covers blocked-autoplay case)
      if (soundPill) {
        soundPill.addEventListener('click', () => {
          video.muted = !video.muted;
          if (!video.muted) {
            video.play().catch(() => { video.muted = true; });
            soundPill.classList.remove('is-muted');
          } else {
            soundPill.classList.add('is-muted');
          }
        });
      }
    });
  }

  /* ---------------- Impact numbers: count up ---------------- */
  const counters = document.querySelectorAll('[data-count-to]');
  if (counters.length) {
    const animateCount = (el) => {
      const target = el.getAttribute('data-count-to');
      const numMatch = target.match(/[\d.]+/);
      if (!numMatch) { el.textContent = target; return; } // non-numeric (e.g. "Multiple")
      const end = parseFloat(numMatch[0]);
      const suffix = target.replace(numMatch[0], '');
      const prefix = target.slice(0, target.indexOf(numMatch[0]));
      const duration = prefersReducedMotion ? 0 : 1200;
      const start = performance.now();

      const step = (now) => {
        const progress = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(end * eased);
        el.textContent = prefix + value + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => countObserver.observe(el));
  }

  /* ---------------- Contact form ---------------- */
  const form = document.querySelector('.form');
  if (form) {
    const status = form.querySelector('.form__status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const message = form.querySelector('#message');

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        status.textContent = 'Please fill in your name, email and message before sending.';
        status.classList.add('is-error');
        return;
      }
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        status.textContent = 'That email address doesn\'t look right — please check it.';
        status.classList.add('is-error');
        return;
      }

      status.classList.remove('is-error');
      status.textContent = 'Opening your email app to send this…';

      const subject = encodeURIComponent(`Website enquiry from ${name.value.trim()}`);
      const interest = form.querySelector('#interest');
      const body = encodeURIComponent(
        `Name: ${name.value.trim()}\nEmail: ${email.value.trim()}` +
        (interest && interest.value ? `\nInterest: ${interest.value}` : '') +
        `\n\nMessage:\n${message.value.trim()}`
      );
      // TODO: replace with Precious's real inbox address (or wire this form
      // up to a service like Formspree/EmailJS for a no-reload submission).
      window.location.href = `mailto:REPLACE_WITH_PRECIOUS_EMAIL@example.com?subject=${subject}&body=${body}`;

      setTimeout(() => {
        status.textContent = 'Thank you — your message is ready to send from your email app.';
      }, 600);
    });
  }

});
