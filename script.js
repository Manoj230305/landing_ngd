/**
 * NexGenDev (NGD) Landing Page - Pure Vanilla JavaScript Logic
 */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. Mobile Menu Drawer Toggle
     -------------------------------------------------------------------------- */
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileBackdrop = document.getElementById('mobileMenuBackdrop');
  const mobileCloseBtn = document.getElementById('mobileMenuCloseBtn');
  const mobileResourcesBtn = document.getElementById('mobileResourcesBtn');
  const mobileResourcesSubmenu = document.getElementById('mobileResourcesSubmenu');

  if (mobileBtn && mobileMenu) {
    function openMobileMenu() {
      mobileMenu.classList.add('open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      if (mobileBackdrop) mobileBackdrop.classList.add('open');
      mobileBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      if (mobileBackdrop) mobileBackdrop.classList.remove('open');
      mobileBtn.setAttribute('aria-expanded', 'false');
      mobileBtn.children[0].style.transform = 'none';
      mobileBtn.children[1].style.transform = 'none';
      document.body.style.overflow = '';
    }

    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMobileMenu();
      });
    }

    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', () => {
        closeMobileMenu();
      });
    }

    // Resources Accordion / Dropdown toggle
    if (mobileResourcesBtn && mobileResourcesSubmenu) {
      mobileResourcesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = mobileResourcesSubmenu.classList.toggle('open');
        mobileResourcesBtn.classList.toggle('open', isOpen);
        mobileResourcesBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    // Close menu when clicking regular links or CTA buttons
    mobileMenu.querySelectorAll('.mobile-link:not(.mobile-dropdown-btn), .mobile-sublink, .mobile-actions a, .waitlist-trigger').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close menu when clicking outside the card
    document.addEventListener('click', (e) => {
      if (mobileMenu.classList.contains('open') && !mobileMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  /* --------------------------------------------------------------------------
     2. Pricing Monthly / Yearly Billing Toggle
     -------------------------------------------------------------------------- */
  const billingToggle = document.getElementById('billingToggle');
  const monthlyLbl = document.getElementById('monthlyLbl');
  const yearlyLbl = document.getElementById('yearlyLbl');
  const priceAmounts = document.querySelectorAll('.plan-price .amount');

  function updatePricing(isYearly) {
    priceAmounts.forEach(amountEl => {
      const targetVal = isYearly ? amountEl.getAttribute('data-yearly') : amountEl.getAttribute('data-monthly');
      if (targetVal !== null) {
        amountEl.style.opacity = '0';
        amountEl.style.transform = 'translateY(-6px)';
        setTimeout(() => {
          amountEl.textContent = targetVal;
          amountEl.style.opacity = '1';
          amountEl.style.transform = 'translateY(0)';
        }, 150);
      }
    });

    if (isYearly) {
      yearlyLbl.classList.add('active');
      monthlyLbl.classList.remove('active');
    } else {
      monthlyLbl.classList.add('active');
      yearlyLbl.classList.remove('active');
    }
  }

  if (billingToggle) {
    // Default checked is false (monthly) to match screenshot
    billingToggle.checked = false;

    billingToggle.addEventListener('change', (e) => {
      updatePricing(e.target.checked);
    });

    monthlyLbl.addEventListener('click', () => {
      billingToggle.checked = false;
      updatePricing(false);
    });

    yearlyLbl.addEventListener('click', () => {
      billingToggle.checked = true;
      updatePricing(true);
    });
  }

  /* --------------------------------------------------------------------------
     3. FAQ Accordion
     -------------------------------------------------------------------------- */
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all other items
      accordionItems.forEach(other => {
        if (other !== item) {
          other.classList.remove('active');
          const otherHeader = other.querySelector('.accordion-header');
          if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove('active');
        header.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('active');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* --------------------------------------------------------------------------
     4. Testimonial Carousel Slider
     -------------------------------------------------------------------------- */
  const testimonialTrack = document.getElementById('testimonialTrack');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  let currentIdx = 0;

  function getVisibleCardsCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function updateCarousel() {
    if (!testimonialTrack) return;
    const cards = testimonialTrack.querySelectorAll('.testimonial-card');
    if (!cards.length) return;

    const visibleCards = getVisibleCardsCount();
    const maxIdx = Math.max(0, cards.length - visibleCards);
    if (currentIdx > maxIdx) currentIdx = maxIdx;

    const cardWidth = cards[0].offsetWidth;
    const gap = 24;
    const shift = (cardWidth + gap) * currentIdx;

    testimonialTrack.style.transform = `translateX(-${shift}px)`;
  }

  if (prevBtn && nextBtn && testimonialTrack) {
    nextBtn.addEventListener('click', () => {
      const cards = testimonialTrack.querySelectorAll('.testimonial-card');
      const visibleCards = getVisibleCardsCount();
      const maxIdx = Math.max(0, cards.length - visibleCards);
      if (currentIdx < maxIdx) {
        currentIdx++;
      } else {
        currentIdx = 0;
      }
      updateCarousel();
    });

    prevBtn.addEventListener('click', () => {
      const cards = testimonialTrack.querySelectorAll('.testimonial-card');
      const visibleCards = getVisibleCardsCount();
      const maxIdx = Math.max(0, cards.length - visibleCards);
      if (currentIdx > 0) {
        currentIdx--;
      } else {
        currentIdx = maxIdx;
      }
      updateCarousel();
    });

    // Touch Swipe Gesture for Mobile & Tablets
    let touchStartX = 0;
    let touchEndX = 0;

    testimonialTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    testimonialTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      const cards = testimonialTrack.querySelectorAll('.testimonial-card');
      const visibleCards = getVisibleCardsCount();
      const maxIdx = Math.max(0, cards.length - visibleCards);

      if (Math.abs(diff) > 40) {
        if (diff > 0 && currentIdx < maxIdx) {
          // Swiped left -> show next
          currentIdx++;
          updateCarousel();
        } else if (diff < 0 && currentIdx > 0) {
          // Swiped right -> show prev
          currentIdx--;
          updateCarousel();
        }
      }
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateCarousel, 100);
    });
  }

  /* --------------------------------------------------------------------------
     5. Feature Chips Active State
     -------------------------------------------------------------------------- */
  const chips = document.querySelectorAll('.feature-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });



  /* --------------------------------------------------------------------------
     6. Waitlist Modal Dialog
     -------------------------------------------------------------------------- */
  const modal = document.getElementById('waitlistModal');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const waitlistTriggers = document.querySelectorAll('.waitlist-trigger');
  const waitlistForm = document.getElementById('waitlistForm');
  const modalSuccess = document.getElementById('modalSuccess');

  function openModal() {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (waitlistForm && modalSuccess) {
      waitlistForm.style.display = 'flex';
      modalSuccess.classList.remove('active');
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  waitlistTriggers.forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });

  if (waitlistForm) {
    waitlistForm.addEventListener('submit', (e) => {
      e.preventDefault();
      waitlistForm.style.display = 'none';
      if (modalSuccess) modalSuccess.classList.add('active');
    });
  }

  /* --------------------------------------------------------------------------
     7. Newsletter Form Submission
     -------------------------------------------------------------------------- */
  const nlForm = document.getElementById('newsletterForm');
  const nlSuccess = document.getElementById('nlSuccess');

  if (nlForm) {
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      nlForm.style.display = 'none';
      if (nlSuccess) nlSuccess.style.display = 'block';
    });
  }

  /* --------------------------------------------------------------------------
     8. Seamless Collaboration Card In-View Animation
     -------------------------------------------------------------------------- */
  const collabPreview = document.querySelector('.preview-collab');
  if (collabPreview && 'IntersectionObserver' in window) {
    const collabObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          collabPreview.classList.add('revealed');
        }
      });
    }, { threshold: 0.25 });

    collabObserver.observe(collabPreview);
  }

  /* --------------------------------------------------------------------------
     9. Stats Counter Count-Up Animation
     -------------------------------------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const targetVal = parseInt(el.getAttribute('data-target'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          if (!isNaN(targetVal)) {
            const duration = 1600;
            const startTime = performance.now();
            function updateNumber(now) {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              const current = Math.floor(ease * targetVal);
              el.textContent = current + suffix;
              if (progress < 1) {
                requestAnimationFrame(updateNumber);
              } else {
                el.textContent = targetVal + suffix;
              }
            }
            requestAnimationFrame(updateNumber);
          }
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.3 });

    statNumbers.forEach(el => statsObserver.observe(el));
  }

  /* --------------------------------------------------------------------------
     10. Contact Form Submission & Reset
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const contactSuccess = document.getElementById('contactSuccess');
  const contactResetBtn = document.getElementById('contactResetBtn');
  const contactSubmitBtn = document.getElementById('contactSubmitBtn');

  if (contactForm && contactSuccess) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic client validation
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        contactSubmitBtn.style.opacity = '0.7';
        contactSubmitBtn.innerHTML = '<span>Sending...</span>';
      }

      setTimeout(() => {
        contactForm.style.display = 'none';
        contactSuccess.style.display = 'flex';
        contactSuccess.classList.add('active');

        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          contactSubmitBtn.style.opacity = '1';
          contactSubmitBtn.innerHTML = '<span>Send Message</span>';
        }
      }, 500);
    });

    if (contactResetBtn) {
      contactResetBtn.addEventListener('click', () => {
        contactForm.reset();
        contactSuccess.style.display = 'none';
        contactSuccess.classList.remove('active');
        contactForm.style.display = 'block';
      });
    }
  }

});

