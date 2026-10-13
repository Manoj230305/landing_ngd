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
     Hero Mockup Scroll Zoom & Enlargement Effect
     Seamless physics-based zoom on scroll down (enlarges image) and
     reverses smoothly on scroll up (shrinks back).
     Targets the mockup dashboard image directly below 'Based on 25,000+ reviews'.
     -------------------------------------------------------------------------- */
  const heroMockupCard = document.getElementById('heroMockupCard');
  const heroGlowBg = document.querySelector('.hero-glow-bg');
  const heroSection = document.getElementById('hero');

  if (heroMockupCard) {
    // Respect accessibility settings
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      let currentProgress = 0;
      let targetProgress = 0;
      let animationFrameId = null;

      // Dynamic scroll threshold: zooms seamlessly as hero scrolls through viewport
      let cachedScrollRange = 650;
      function updateScrollRange() {
        const heroHeight = heroSection ? heroSection.offsetHeight : 1100;
        // Range spans across 65% of hero height, capped comfortably between 480px and 850px
        cachedScrollRange = Math.min(Math.max(heroHeight * 0.65, 480), 850);
      }
      updateScrollRange();

      function computeTargetProgress() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        return Math.min(Math.max(scrollY / cachedScrollRange, 0), 1);
      }

      function renderFrame() {
        // Silky exponential lerp damping (0.082 provides luxurious inertia and no stepping)
        const lerpFactor = 0.082;
        currentProgress += (targetProgress - currentProgress) * lerpFactor;

        // Threshold check to snap cleanly and stop the RAF loop when idle
        const diff = Math.abs(targetProgress - currentProgress);
        if (diff < 0.0004) {
          currentProgress = targetProgress;
        }

        // Responsive scale and perspective pitch parameters
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

        // Made noticeably smaller at rest (0.78) and enlarges cleanly to full bounds (1.00)
        // so it never crosses the section boundary, overlaps, or gets cut off
        const startScale = isMobile ? 0.82 : (isTablet ? 0.80 : 0.78);
        const endScale   = isMobile ? 0.96 : (isTablet ? 0.98 : 1.00);
        const startTilt  = isMobile ? 4.0  : 7.5; // subtle 3D perspective pitch in degrees
        const endTilt    = 0.0;                   // levels out flat to the screen

        // Smooth cubic ease-out curve for natural visual momentum
        const eased = 1 - Math.pow(1 - currentProgress, 2.2);

        const scale = startScale + (endScale - startScale) * eased;
        const tilt  = startTilt + (endTilt - startTilt) * eased;

        // 3D hardware-accelerated transform
        heroMockupCard.style.transform = `scale3d(${scale.toFixed(4)}, ${scale.toFixed(4)}, 1) rotateX(${tilt.toFixed(2)}deg)`;

        // Dynamic depth: box shadow expands and deepens as image enlarges towards the viewer
        const shadowY     = (24 + 30 * eased).toFixed(1);
        const shadowBlur  = (55 + 45 * eased).toFixed(1);
        const shadowAlpha = (0.13 + 0.10 * eased).toFixed(3);
        heroMockupCard.style.boxShadow = `0 ${shadowY}px ${shadowBlur}px -20px rgba(0, 0, 0, ${shadowAlpha}), 0 12px 28px -10px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)`;

        // Synchronized ambient glow enlargement and brightness behind mockup
        if (heroGlowBg) {
          const glowScale   = (0.80 + 0.20 * eased).toFixed(4);
          const glowOpacity = (0.65 + 0.22 * eased).toFixed(3);
          heroGlowBg.style.transform = `translateX(-50%) scale(${glowScale})`;
          heroGlowBg.style.opacity = glowOpacity;
        }

        // Continue running until perfectly converged, then sleep
        if (diff >= 0.0004) {
          animationFrameId = requestAnimationFrame(renderFrame);
        } else {
          animationFrameId = null;
        }
      }

      function handleScroll() {
        targetProgress = computeTargetProgress();
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(renderFrame);
        }
      }

      function handleResize() {
        updateScrollRange();
        targetProgress = computeTargetProgress();
        if (!animationFrameId) {
          animationFrameId = requestAnimationFrame(renderFrame);
        }
      }

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize, { passive: true });

      // Initialize instantly on page load (snap currentProgress so no jarring jumps)
      targetProgress = computeTargetProgress();
      currentProgress = targetProgress;
      renderFrame();
    }
  }

  /* --------------------------------------------------------------------------
     4. Testimonial Carousel Slider (Auto-advancing card by card every 3.5s)
     -------------------------------------------------------------------------- */
  const testimonialTrack = document.getElementById('testimonialTrack');
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  const testimonialWrap = document.querySelector('.testimonial-carousel-wrap');
  let currentIdx = 0;
  let autoPlayTimer = null;
  const AUTOPLAY_INTERVAL = 3500; // Auto moves card by card every 3.5 seconds

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
    if (currentIdx > maxIdx) currentIdx = 0;
    if (currentIdx < 0) currentIdx = maxIdx;

    const cardWidth = cards[0].offsetWidth;
    const gap = 24;
    const shift = (cardWidth + gap) * currentIdx;

    testimonialTrack.style.transform = `translateX(-${shift}px)`;
  }

  function advanceNextCard() {
    if (!testimonialTrack) return;
    const cards = testimonialTrack.querySelectorAll('.testimonial-card');
    const visibleCards = getVisibleCardsCount();
    const maxIdx = Math.max(0, cards.length - visibleCards);
    if (currentIdx < maxIdx) {
      currentIdx++;
    } else {
      currentIdx = 0;
    }
    updateCarousel();
  }

  function advancePrevCard() {
    if (!testimonialTrack) return;
    const cards = testimonialTrack.querySelectorAll('.testimonial-card');
    const visibleCards = getVisibleCardsCount();
    const maxIdx = Math.max(0, cards.length - visibleCards);
    if (currentIdx > 0) {
      currentIdx--;
    } else {
      currentIdx = maxIdx;
    }
    updateCarousel();
  }

  function startAutoplay() {
    stopAutoplay();
    autoPlayTimer = setInterval(advanceNextCard, AUTOPLAY_INTERVAL);
  }

  function stopAutoplay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  if (testimonialTrack) {
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        advanceNextCard();
        resetAutoplay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        advancePrevCard();
        resetAutoplay();
      });
    }

    // Pause autoplay on mouse hover, resume on mouse leave
    if (testimonialWrap) {
      testimonialWrap.addEventListener('mouseenter', stopAutoplay);
      testimonialWrap.addEventListener('mouseleave', startAutoplay);
    } else {
      testimonialTrack.addEventListener('mouseenter', stopAutoplay);
      testimonialTrack.addEventListener('mouseleave', startAutoplay);
    }

    // Touch Swipe Gesture for Mobile & Tablets
    let touchStartX = 0;
    let touchEndX = 0;

    testimonialTrack.addEventListener('touchstart', (e) => {
      stopAutoplay();
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    testimonialTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      startAutoplay();
    }, { passive: true });

    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          advanceNextCard();
        } else {
          advancePrevCard();
        }
        resetAutoplay();
      }
    }

    // Pause autoplay when document is in background/tab switched
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateCarousel, 100);
    });

    // Start autoplay initially
    startAutoplay();
    updateCarousel();
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
  /* --------------------------------------------------------------------------
     8. Framer-Style Staggered Scroll Reveal System (like allly.framer.website)
     Continuous fluid single-motion reveal — no discrete steps or hesitation
     -------------------------------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05
      };

      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target;
            target.classList.add('in-view', 'reveal', 'visible', 'revealed');
            
            // Clean up entrance lock after animation completes so hover transforms & accordion clicks remain snappy
            const delaySec = parseFloat(target.style.transitionDelay || target.style.animationDelay || '0');
            setTimeout(() => {
              target.classList.remove('framer-reveal');
              target.classList.add('revealed-done');
              target.style.transitionDelay = '';
              target.style.animationDelay = '';
            }, Math.round((delaySec * 1000) + 750));

            observer.unobserve(target);
          }
        });
      }, observerOptions);

      // Select all sections below hero, plus the footer
      const sectionContainers = document.querySelectorAll(
        'section:not(.hero-section), footer.site-footer'
      );

      const revealSelectors = [
        '.section-header > *',
        '.dark-card-header > *',
        '.about-header > *',
        '.comparison-header > *',
        '.overview-header > *',
        '.logos-heading',
        '.marquee-wrapper',
        '.bento-card',
        '.feature-pills-mask-wrapper',
        '.stats-banner-card',
        '.integrations-network-stage',
        '.testimonial-card',
        '.carousel-nav-btns',
        '.stat-item',
        '.pricing-card',
        '.about-card',
        '.comp-card-wrapper',
        '.comp-vs-badge',
        '.comp-cta',
        '.overview-mockup-wrapper',
        '.overview-feature-col',
        '.spotlight-stars',
        '.spotlight-quote',
        '.spotlight-author',
        '.faq-left > *',
        '.accordion-item',
        '.faq-contact-card',
        '.final-cta-card',
        '.footer-newsletter',
        '.footer-brand',
        '.footer-right'
      ].join(', ');

      sectionContainers.forEach(section => {
        const items = section.querySelectorAll(revealSelectors);

        if (items.length) {
          items.forEach((item, index) => {
            item.classList.add('framer-reveal');
            // Subtle micro-ripple: 0.04s between consecutive elements, capped at 0.20s
            const delay = Math.min(index * 0.04, 0.20);
            item.style.transitionDelay = `${delay.toFixed(2)}s`;
            item.style.animationDelay = `${delay.toFixed(2)}s`;
            revealObserver.observe(item);
          });
        }
      });

      // Also observe any elements manually tagged with .hidden or .reveal
      document.querySelectorAll('.hidden:not(.framer-reveal):not(.revealed-done), .reveal:not(.framer-reveal):not(.revealed-done), .scroll-reveal:not(.framer-reveal):not(.revealed-done)').forEach((el, index) => {
        el.classList.add('framer-reveal');
        const delay = Math.min(index * 0.04, 0.20);
        el.style.transitionDelay = `${delay.toFixed(2)}s`;
        el.style.animationDelay = `${delay.toFixed(2)}s`;
        revealObserver.observe(el);
      });
    }
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
     9b. Overview Section: Breadthwise Elongation & Flying Widgets on Scroll
     -------------------------------------------------------------------------- */
  const overviewCard = document.querySelector('.overview-card');
  const overviewStage = document.querySelector('.overview-mockup-stage');
  if (overviewCard && overviewStage) {
    const widgets = overviewStage.querySelectorAll('.overview-float-widget');
    const workSummary = overviewStage.querySelector('.widget-work-summary');
    const taskCard = overviewStage.querySelector('.widget-task-card');

    // 1. Entrance Observer: gradual fly-up from below
    if ('IntersectionObserver' in window) {
      const overviewEntranceObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            overviewCard.classList.add('in-view', 'revealed');
            overviewStage.classList.add('in-view', 'revealed');
            widgets.forEach(w => w.classList.add('in-view', 'revealed'));
            observer.unobserve(entry.target);
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08
      });
      overviewEntranceObserver.observe(overviewCard);
    } else {
      overviewCard.classList.add('in-view', 'revealed');
      overviewStage.classList.add('in-view', 'revealed');
      widgets.forEach(w => w.classList.add('in-view', 'revealed'));
    }

    // 2. Smooth Continuous Widget Parallax Fly-Over
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      let overviewTicking = false;

      function updateOverviewScroll() {
        const rect = overviewCard.getBoundingClientRect();
        const winHeight = window.innerHeight;

        // Active whenever card is near or within the viewport
        if (rect.bottom > -150 && rect.top < winHeight + 150) {
          // Flying Widgets Scroll Parallax Offset
          const centerDiff = (rect.top + rect.height * 0.5) - (winHeight * 0.5);
          if (workSummary) {
            const py1 = Math.max(-42, Math.min(42, centerDiff * 0.06));
            workSummary.style.setProperty('--widget-parallax-y', `${py1.toFixed(1)}px`);
          }
          if (taskCard) {
            const py2 = Math.max(-54, Math.min(54, centerDiff * 0.08));
            taskCard.style.setProperty('--widget-parallax-y', `${py2.toFixed(1)}px`);
          }
        }
        overviewTicking = false;
      }

      function onOverviewScroll() {
        if (!overviewTicking) {
          overviewTicking = true;
          window.requestAnimationFrame(updateOverviewScroll);
        }
      }

      window.addEventListener('scroll', onOverviewScroll, { passive: true });
      window.addEventListener('resize', onOverviewScroll, { passive: true });
      updateOverviewScroll();
    }
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

  /* --------------------------------------------------------------------------
     11. Interactive Integrations Network Controller
     -------------------------------------------------------------------------- */
  const stage = document.getElementById('integrationsStage');
  const svg = document.getElementById('integrationsSvg');
  const hub = document.getElementById('netHub');
  const appNodes = document.querySelectorAll('.net-app-node');

  if (stage && svg && hub && appNodes.length) {
    // Function to calculate and update precise dynamic SVG bezier curves
    function updateNetworkPaths() {
      const svgRect = svg.getBoundingClientRect();
      if (!svgRect.width || !svgRect.height) return;

      const hubRect = hub.getBoundingClientRect();
      // Center hub connection anchors - all lines converge at the vertical center of the hub
      const hubLeftX = ((hubRect.left - svgRect.left) / svgRect.width) * 1000;
      const hubRightX = ((hubRect.right - svgRect.left) / svgRect.width) * 1000;
      const hubMidY = (((hubRect.top + hubRect.height / 2) - svgRect.top) / svgRect.height) * 560;

      appNodes.forEach(node => {
        const target = node.getAttribute('data-target');
        const nodeRect = node.getBoundingClientRect();
        if (!nodeRect.width) return;

        const isLeft = ['slack', 'jira', 'zapier', 'sheets'].includes(target);
        const isCorner = ['slack', 'sheets', 'mailchimp', 'g2'].includes(target);
        const isTop = ['slack', 'jira', 'mailchimp', 'dropbox'].includes(target);

        const startY = hubMidY;
        let startX, endX, endY, pathD;

        if (isLeft) {
          startX = hubLeftX;
          endX = ((nodeRect.right - svgRect.left) / svgRect.width) * 1000;
          endY = (((nodeRect.top + nodeRect.height / 2) - svgRect.top) / svgRect.height) * 560;

          const spanX = startX - endX;
          const spanY = Math.abs(endY - startY);

          if (isCorner) {
            // Slack & Sheets: Tight vertical chimney flanking the hub, then sweeping curve into card
            const cornerDist = Math.max(22, Math.min(52, spanX * 0.22));
            const cornerX = startX - cornerDist;
            const r1 = Math.min(48, cornerDist * 0.90, spanY * 0.32);
            const k1 = r1 * 0.552;
            const r2 = Math.min(62, (cornerX - endX) * 0.40, spanY * 0.38);
            const k2 = r2 * 0.552;

            if (isTop) {
              // Slack: Curves UP into vertical chimney, then sweeping curve LEFT into card
              pathD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} ` +
                      `L ${(cornerX + r1).toFixed(1)} ${startY.toFixed(1)} ` +
                      `C ${(cornerX + r1 - k1).toFixed(1)} ${startY.toFixed(1)}, ${cornerX.toFixed(1)} ${(startY - r1 + k1).toFixed(1)}, ${cornerX.toFixed(1)} ${(startY - r1).toFixed(1)} ` +
                      `L ${cornerX.toFixed(1)} ${(endY + r2).toFixed(1)} ` +
                      `C ${cornerX.toFixed(1)} ${(endY + r2 - k2).toFixed(1)}, ${(cornerX - r2 + k2).toFixed(1)} ${endY.toFixed(1)}, ${(cornerX - r2).toFixed(1)} ${endY.toFixed(1)} ` +
                      `L ${endX.toFixed(1)} ${endY.toFixed(1)}`;
            } else {
              // Sheets: Curves DOWN into vertical chimney, then sweeping curve LEFT into card
              pathD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} ` +
                      `L ${(cornerX + r1).toFixed(1)} ${startY.toFixed(1)} ` +
                      `C ${(cornerX + r1 - k1).toFixed(1)} ${startY.toFixed(1)}, ${cornerX.toFixed(1)} ${(startY + r1 - k1).toFixed(1)}, ${cornerX.toFixed(1)} ${(startY + r1).toFixed(1)} ` +
                      `L ${cornerX.toFixed(1)} ${(endY - r2).toFixed(1)} ` +
                      `C ${cornerX.toFixed(1)} ${(endY - r2 + k2).toFixed(1)}, ${(cornerX - r2 + k2).toFixed(1)} ${endY.toFixed(1)}, ${(cornerX - r2).toFixed(1)} ${endY.toFixed(1)} ` +
                      `L ${endX.toFixed(1)} ${endY.toFixed(1)}`;
            }
          } else {
            // Jira & Zapier: Curves up/down from hub and flows into horizontal line to card
            const leadOut = Math.max(16, Math.min(65, spanX * 0.22));
            const leadX = endX + leadOut;
            const curveSpan = startX - leadX;
            const dx = curveSpan * 0.42;

            pathD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} ` +
                    `C ${(startX - dx).toFixed(1)} ${startY.toFixed(1)}, ${(leadX + dx).toFixed(1)} ${endY.toFixed(1)}, ${leadX.toFixed(1)} ${endY.toFixed(1)} ` +
                    `L ${endX.toFixed(1)} ${endY.toFixed(1)}`;
          }
        } else {
          // Right side: Mailchimp, Dropbox, Figma, G2
          startX = hubRightX;
          endX = ((nodeRect.left - svgRect.left) / svgRect.width) * 1000;
          endY = (((nodeRect.top + nodeRect.height / 2) - svgRect.top) / svgRect.height) * 560;

          const spanX = endX - startX;
          const spanY = Math.abs(endY - startY);

          if (isCorner) {
            // Mailchimp & G2: Tight vertical chimney flanking the hub, then sweeping curve into card
            const cornerDist = Math.max(22, Math.min(52, spanX * 0.22));
            const cornerX = startX + cornerDist;
            const r1 = Math.min(48, cornerDist * 0.90, spanY * 0.32);
            const k1 = r1 * 0.552;
            const r2 = Math.min(62, (endX - cornerX) * 0.40, spanY * 0.38);
            const k2 = r2 * 0.552;

            if (isTop) {
              // Mailchimp: Curves UP into vertical chimney, then sweeping curve RIGHT into card
              pathD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} ` +
                      `L ${(cornerX - r1).toFixed(1)} ${startY.toFixed(1)} ` +
                      `C ${(cornerX - r1 + k1).toFixed(1)} ${startY.toFixed(1)}, ${cornerX.toFixed(1)} ${(startY - r1 + k1).toFixed(1)}, ${cornerX.toFixed(1)} ${(startY - r1).toFixed(1)} ` +
                      `L ${cornerX.toFixed(1)} ${(endY + r2).toFixed(1)} ` +
                      `C ${cornerX.toFixed(1)} ${(endY + r2 - k2).toFixed(1)}, ${(cornerX + r2 - k2).toFixed(1)} ${endY.toFixed(1)}, ${(cornerX + r2).toFixed(1)} ${endY.toFixed(1)} ` +
                      `L ${endX.toFixed(1)} ${endY.toFixed(1)}`;
            } else {
              // G2: Curves DOWN into vertical chimney, then sweeping curve RIGHT into card
              pathD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} ` +
                      `L ${(cornerX - r1).toFixed(1)} ${startY.toFixed(1)} ` +
                      `C ${(cornerX - r1 + k1).toFixed(1)} ${startY.toFixed(1)}, ${cornerX.toFixed(1)} ${(startY + r1 - k1).toFixed(1)}, ${cornerX.toFixed(1)} ${(startY + r1).toFixed(1)} ` +
                      `L ${cornerX.toFixed(1)} ${(endY - r2).toFixed(1)} ` +
                      `C ${cornerX.toFixed(1)} ${(endY - r2 + k2).toFixed(1)}, ${(cornerX + r2 - k2).toFixed(1)} ${endY.toFixed(1)}, ${(cornerX + r2).toFixed(1)} ${endY.toFixed(1)} ` +
                      `L ${endX.toFixed(1)} ${endY.toFixed(1)}`;
            }
          } else {
            // Dropbox & Figma: Curves up/down from hub and flows into horizontal line to card
            const leadOut = Math.max(16, Math.min(65, spanX * 0.22));
            const leadX = endX - leadOut;
            const curveSpan = leadX - startX;
            const dx = curveSpan * 0.42;

            pathD = `M ${startX.toFixed(1)} ${startY.toFixed(1)} ` +
                    `C ${(startX + dx).toFixed(1)} ${startY.toFixed(1)}, ${(leadX - dx).toFixed(1)} ${endY.toFixed(1)}, ${leadX.toFixed(1)} ${endY.toFixed(1)} ` +
                    `L ${endX.toFixed(1)} ${endY.toFixed(1)}`;
          }
        }

        const baseWire = document.getElementById(`wire-${target}`);
        const actWire = document.getElementById(`wire-active-${target}`);
        const pulseWire = document.getElementById(`pulse-${target}`);

        if (baseWire) baseWire.setAttribute('d', pathD);
        if (actWire) actWire.setAttribute('d', pathD);
        if (pulseWire) pulseWire.setAttribute('d', pathD);
      });
    }

    // Interactive Hover & Focus Linking for individual app nodes
    appNodes.forEach(node => {
      const target = node.getAttribute('data-target');
      const actWire = document.getElementById(`wire-active-${target}`);
      const pulseWire = document.getElementById(`pulse-${target}`);

      function activate() {
        node.classList.add('is-hovered');
        if (actWire) actWire.classList.add('is-active');
        if (pulseWire) pulseWire.classList.add('boost-speed');
      }

      function deactivate() {
        node.classList.remove('is-hovered');
        if (actWire) actWire.classList.remove('is-active');
        if (pulseWire) pulseWire.classList.remove('boost-speed');
      }

      node.addEventListener('mouseenter', activate);
      node.addEventListener('mouseleave', deactivate);
      node.addEventListener('focus', activate);
      node.addEventListener('blur', deactivate);

      // Click reaction
      node.addEventListener('click', () => {
        activate();
        stage.classList.add('node-clicked');
        setTimeout(() => {
          stage.classList.remove('node-clicked');
        }, 600);
      });
    });

    // Hub Hover: Lights up all 8 connections with radiant energy
    hub.addEventListener('mouseenter', () => {
      stage.classList.add('stage-all-active');
    });

    hub.addEventListener('mouseleave', () => {
      stage.classList.remove('stage-all-active');
    });

    hub.addEventListener('click', () => {
      stage.classList.add('stage-all-active');
      setTimeout(() => {
        stage.classList.remove('stage-all-active');
      }, 1500);
    });

    // Run calibration on load and resize
    updateNetworkPaths();

    if ('ResizeObserver' in window) {
      const stageObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(updateNetworkPaths);
      });
      stageObserver.observe(stage);
    } else {
      window.addEventListener('resize', () => {
        window.requestAnimationFrame(updateNetworkPaths);
      });
    }

    // Re-verify once fonts or images are fully settled
    window.addEventListener('load', updateNetworkPaths);
  }

  /* --------------------------------------------------------------------------
     14. Sticky Header Dynamic Scrolled State & Nav Active State
     -------------------------------------------------------------------------- */
  const siteHeader = document.getElementById('siteHeader');
  if (siteHeader) {
    const onScrollHeader = () => {
      if (window.scrollY > 15) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();
  }

  // Active section scrollspy for desktop navigation
  const desktopNavLinks = document.querySelectorAll('.nav-links .nav-link:not(.dropdown-toggle)');
  if (desktopNavLinks.length > 0) {
    const navSections = ['features', 'integrations', 'pricing'].map(id => ({
      id,
      el: document.getElementById(id)
    })).filter(item => item.el !== null);

    if (navSections.length > 0) {
      let isManualScroll = false;
      let manualTimeout;
      let cachedSectionBounds = [];

      function cacheSectionBounds() {
        cachedSectionBounds = navSections.map(sec => ({
          id: sec.id,
          top: sec.el.offsetTop,
          height: sec.el.offsetHeight
        }));
      }
      cacheSectionBounds();
      window.addEventListener('resize', cacheSectionBounds, { passive: true });

      desktopNavLinks.forEach(link => {
        link.addEventListener('click', () => {
          desktopNavLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          isManualScroll = true;
          clearTimeout(manualTimeout);
          manualTimeout = setTimeout(() => {
            isManualScroll = false;
          }, 850);
        });
      });

      let spyTicking = false;
      const onScrollSpy = () => {
        if (isManualScroll || spyTicking) return;
        spyTicking = true;
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 140;
          let currentId = '';

          for (let i = 0; i < cachedSectionBounds.length; i++) {
            const sec = cachedSectionBounds[i];
            if (scrollPosition >= sec.top && scrollPosition < sec.top + sec.height) {
              currentId = sec.id;
              break;
            }
          }

          if (currentId) {
            desktopNavLinks.forEach(link => {
              const href = link.getAttribute('href');
              if (href === '#' + currentId || href.endsWith('#' + currentId)) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
          spyTicking = false;
        });
      };

      window.addEventListener('scroll', onScrollSpy, { passive: true });
    }
  }

  // Smooth animated anchor link scrolling with header offset
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const hash = this.getAttribute('href');
      if (hash && hash.startsWith('#') && hash.length > 1) {
        const target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          const headerOffset = 90;
          const elementPos = target.getBoundingClientRect().top;
          const offsetPos = elementPos + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPos,
            behavior: 'smooth'
          });
        }
      }
    });
  });

});



