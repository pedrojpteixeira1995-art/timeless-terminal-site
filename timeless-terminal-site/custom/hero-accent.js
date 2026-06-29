/* Hero title â€” "SplitText"-style reveal (React Bits effect) reproduced with
   the page's existing GSAP (this is a static export, not a React build).
   - wraps "Thinks" in .hero-thinks (gold + underline)
   - splits the title into .split-word > .split-char spans
   - animates chars: opacity 0->1, y 40->0, staggered, ease power3.out
   Idempotent + runs a few times to catch the late React render.
   Falls back to fully-visible if GSAP is missing. */
(function () {
  var SELECTOR = '.section_hero .hero_h h1';
  var done = false;
  var subtitleDone = false;

  function buildChars(container, collect) {
    var nodes = Array.prototype.slice.call(container.childNodes);
    nodes.forEach(function (n) {
      if (n.nodeType === 3) {
        // text node -> words (.split-word) of chars (.split-char)
        var frag = document.createDocumentFragment();
        var parts = n.textContent.split(/(\s+)/); // keep whitespace tokens
        parts.forEach(function (tok) {
          if (tok === '') return;
          if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
          var word = document.createElement('span');
          word.className = 'split-word';
          for (var i = 0; i < tok.length; i++) {
            var c = document.createElement('span');
            c.className = 'split-char';
            c.textContent = tok[i];
            collect.push(c);
            word.appendChild(c);
          }
          frag.appendChild(word);
        });
        container.replaceChild(frag, n);
      } else if (n.nodeName === 'BR') {
        /* keep line break */
      } else if (n.nodeType === 1) {
        // element (e.g. .hero-thinks) -> recurse so its letters split too
        buildChars(n, collect);
      }
    });
  }

  function run() {
    if (done) return true;
    var h1 = document.querySelector(SELECTOR);
    if (!h1) return false;
    if (h1.dataset.ttSplit === '1') return true;
    if (h1.textContent.indexOf('Thinks') === -1) return false;

    // accent the word first, then split everything into chars
    if (!h1.querySelector('.hero-thinks')) {
      h1.innerHTML = h1.innerHTML.replace('Thinks', '<span class="hero-thinks">Thinks</span>');
    }
    var chars = [];
    buildChars(h1, chars);
    h1.dataset.ttSplit = '1';

    var g = window.gsap;
    if (g && chars.length) {
      g.set(chars, { opacity: 0, yPercent: 0, y: 40 });
      g.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.035,
        force3D: true,
        onComplete: function () {
          done = true;
          h1.classList.add('tt-anim-done');
        }
      });
    } else {
      // no GSAP -> just show it
      done = true;
      h1.classList.add('tt-anim-done');
    }
    return true;
  }

  function runSubtitle() {
    if (subtitleDone) return true;
    var subtitle = document.querySelector('.section_hero .hero_h .text-color-secondary');
    if (!subtitle) return false;

    if (subtitle.dataset.ttCopy !== '1') {
      subtitle.textContent = 'Institutional-grade intelligence for macro, crypto, smart money, execution, and AI strategy.';
      subtitle.dataset.ttCopy = '1';
    }

    subtitle.removeAttribute('data-w-id');
    subtitle.removeAttribute('words-slide-from-right');
    subtitle.removeAttribute('letters-fade-in');
    subtitle.removeAttribute('text-split');
    subtitle.style.opacity = '1';
    subtitle.style.transform = 'none';

    if (subtitle.dataset.ttSplit === '1') return true;

    var chars = [];
    buildChars(subtitle, chars);
    subtitle.dataset.ttSplit = '1';

    function lockSubtitleFinalState() {
      subtitle.style.opacity = '1';
      subtitle.style.transform = 'none';
      subtitle.style.transition = 'none';
      chars.forEach(function (c) {
        c.style.opacity = '1';
        c.style.transform = 'none';
        c.style.transition = 'none';
      });
    }

    function guardAgainstWebflowReplay() {
      var until = Date.now() + 4500;
      var timer = setInterval(function () {
        lockSubtitleFinalState();
        if (Date.now() > until) clearInterval(timer);
      }, 80);
    }

    var g = window.gsap;
    if (g && chars.length) {
      try { g.killTweensOf([subtitle].concat(chars)); } catch (_) {}
      g.set(subtitle, { opacity: 1 });
      g.set(chars, { opacity: 0, y: 22 });
      g.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger: 0.012,
        delay: 0.42,
        force3D: true,
        onComplete: function () {
          subtitleDone = true;
          lockSubtitleFinalState();
          guardAgainstWebflowReplay();
        }
      });
    } else {
      subtitleDone = true;
      lockSubtitleFinalState();
      guardAgainstWebflowReplay();
    }

    return true;
  }

  function safetyReveal() {
    if (done) return;
    var h1 = document.querySelector(SELECTOR);
    if (!h1) return;
    h1.querySelectorAll('.split-char').forEach(function (c) {
      c.style.opacity = '1';
      c.style.transform = 'none';
    });
    h1.classList.add('tt-anim-done');
    done = true;
  }

  // Navbar CTA: relabel "Start Your Trial" -> "JOIN NOW" (gold button via CSS)
  function joinNow() {
    var divs = document.querySelectorAll('a.button.is-nav > div');
    var any = false;
    divs.forEach(function (d) {
      if (!d.querySelector('*') && /start your trial/i.test(d.textContent)) {
        d.textContent = 'JOIN NOW';
      }
      if (d.textContent.trim() === 'JOIN NOW') any = true;
    });
    return any;
  }

  // Floating-pill header on scroll (header-2 effect): toggle .tt-scrolled
  function initNavScroll() {
    var nav = document.querySelector('.navbar.w-nav') || document.querySelector('.navbar');
    if (!nav) return false;
    if (nav.dataset.ttScroll === '1') return true;
    nav.dataset.ttScroll = '1';
    var THRESH = 10;
    function update(y) {
      if ((y || 0) > THRESH) nav.classList.add('tt-scrolled');
      else nav.classList.remove('tt-scrolled');
    }
    function onScroll() { update(window.pageYOffset || window.scrollY || 0); }
    window.addEventListener('scroll', onScroll, { passive: true });
    if (window.lenis && typeof window.lenis.on === 'function') {
      try { window.lenis.on('scroll', function (e) { update((e && e.scroll) || window.scrollY || 0); }); } catch (_) {}
    }
    onScroll();
    return true;
  }

  function scrubLegacyBranding() {
    document.querySelectorAll('.w-webflow-badge, a[href*="webflow.com?utm_campaign=brandjs"]').forEach(function (el) {
      el.remove();
    });

    document.querySelectorAll('.hero_icon, .get_icon, .title-icon').forEach(function (el) {
      el.remove();
    });

    document.querySelectorAll('a[href*="Timeless Terminal"], a[href^="mailto:sales@Timeless Terminal.com"]').forEach(function (a) {
      if (/mailto:/i.test(a.href)) {
        a.href = 'mailto:contact@timelessterminal.com';
        a.textContent = 'contact@timelessterminal.com';
      } else {
        a.href = a.href.replace(/Timeless Terminal-live\.webflow\.io/gi, 'timelessterminal.com');
      }
    });

    document.querySelectorAll('.footer_btm-content > div:first-child').forEach(function (el) {
      if (/Alpha|Ledger|rights reserved/i.test(el.textContent)) {
        el.textContent = 'Copyright 2026 Timeless Terminal. All rights reserved.';
      }
    });

    document.querySelectorAll('.footer_text').forEach(function (el) {
      if (/Alpha|Ledger/i.test(el.textContent)) el.textContent = 'Timeless Terminal';
    });

    return true;
  }

  function initHeroSignals() {
    var hero = document.querySelector('.section_hero');
    if (!hero) return false;
    hero.querySelectorAll('.tt-signal-layer').forEach(function (layer) { layer.remove(); });

    var subtitle = hero.querySelector('.hero_h .text-color-secondary');
    if (subtitle && subtitle.dataset.ttCopy !== '1' && subtitle.dataset.ttSplit !== '1') {
      subtitle.textContent = 'Institutional-grade intelligence for macro, crypto, smart money, execution, and AI strategy.';
      subtitle.dataset.ttCopy = '1';
    }

    return true;
  }

  function initSummaryReveal() {
    var section = document.querySelector('.tt-simple-summary');
    if (!section) return true;
    if (section.dataset.ttReveal === '1') return true;
    section.dataset.ttReveal = '1';
    var phrases = Array.prototype.slice.call(section.querySelectorAll('.tt-reveal-phrase'));

    function clamp(v) {
      return Math.max(0, Math.min(1, v));
    }

    function rgba(rgb, alpha) {
      return 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', ' + alpha.toFixed(3) + ')';
    }

    function update() {
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight || 800;
      var start = vh * 0.7;
      var end = vh * -0.02;
      var progress = clamp((start - rect.top) / (start - end));
      var count = phrases.length || 1;

      phrases.forEach(function (phrase, index) {
        var localStart = index / (count + 0.95);
        var localEnd = (index + 0.9) / (count + 0.95);
        var local = clamp((progress - localStart) / (localEnd - localStart));
        var eased = 1 - Math.pow(1 - local, 2);
        var textAlpha = 0.3 + (0.7 * eased);
        var goldAlpha = 0.32 + (0.68 * eased);
        phrase.style.color = rgba([10, 10, 15], textAlpha);
        phrase.querySelectorAll('.tt-gold-mark').forEach(function (mark) {
          mark.style.color = rgba([201, 168, 76], goldAlpha);
        });
        phrase.querySelectorAll('.tt-quiet-mark').forEach(function (mark) {
          mark.style.setProperty('--tt-summary-underline-opacity', String(0.24 + (0.76 * eased)));
        });
      });
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    if (window.lenis && typeof window.lenis.on === 'function') {
      try { window.lenis.on('scroll', onScroll); } catch (_) {}
    }
    update();
    return true;
  }

  function stabilizeProductCards() {
    var section = document.querySelector('.tt-terminal-products');
    if (!section) return true;
    section.querySelectorAll('[words-slide-from-right], [text-split]').forEach(function (el) {
      el.removeAttribute('words-slide-from-right');
      el.removeAttribute('text-split');
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    var heading = section.querySelector('.products_c-content h5');
    if (heading) heading.textContent = 'Our Products';
    var titles = section.querySelectorAll('.products_card-title');
    ['AI Strategy', "God's Eye", 'CHRONOS', 'Trading Room', 'Smart Money'].forEach(function (title, index) {
      if (titles[index]) titles[index].textContent = title;
    });
    var cardMeta = [
      { kicker: 'STRATEGY AGENT', points: ['Active signals', 'Memory layer'] },
      { kicker: 'GLOBAL INTELLIGENCE', points: ['Live map', 'Risk feed'] },
      { kicker: 'RESEARCH ENGINE', points: ['Macro synthesis', 'Deep reasoning'] },
      { kicker: 'EXECUTION ROOM', points: ['Chart review', 'Live context'] },
      { kicker: 'CAPITAL FLOWS', points: ['13F tracking', 'Consensus picks'] }
    ];
    section.querySelectorAll('.tt-terminal-product-card').forEach(function (card, index) {
      var bottom = card.querySelector('.products_c-btm');
      var title = card.querySelector('.products_card-title');
      var icon = card.querySelector('.tt-terminal-icon');
      if (icon && icon.parentElement !== card) {
        card.insertBefore(icon, card.firstElementChild);
      }
      if (!bottom || !title) return;
      if (!bottom.querySelector('.tt-terminal-card-kicker')) {
        var kicker = document.createElement('div');
        kicker.className = 'tt-terminal-card-kicker';
        kicker.textContent = (cardMeta[index] && cardMeta[index].kicker) || 'INTELLIGENCE LAYER';
        bottom.insertBefore(kicker, title);
      }
      if (!bottom.querySelector('.tt-terminal-card-meta')) {
        var description = Array.prototype.slice.call(bottom.children).find(function (child) {
          return child !== title &&
            !child.classList.contains('tt-terminal-card-kicker') &&
            !child.classList.contains('products_wrap-btn');
        });
        var meta = document.createElement('div');
        meta.className = 'tt-terminal-card-meta';
        ((cardMeta[index] && cardMeta[index].points) || ['Live data', 'AI context']).forEach(function (point) {
          var pill = document.createElement('span');
          pill.textContent = point;
          meta.appendChild(pill);
        });
        if (description && description.nextSibling) {
          bottom.insertBefore(meta, description.nextSibling);
        } else {
          bottom.insertBefore(meta, bottom.querySelector('.products_wrap-btn'));
        }
      }
    });
    return true;
  }

  function initProductLaptopMotion() {
    var section = document.querySelector('.tt-terminal-products');
    if (!section) return true;
    if (section.dataset.ttLaptopMotion === '1') return true;

    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {}
    if (reduceMotion) return true;

    var cards = Array.prototype.slice.call(section.querySelectorAll('.tt-terminal-product-card'));
    if (!cards.length) return true;
    section.dataset.ttLaptopMotion = '1';

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function update() {
      var vw = window.innerWidth || document.documentElement.clientWidth || 1280;
      var vh = window.innerHeight || document.documentElement.clientHeight || 800;
      var midpoint = vw / 2;
      cards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        var cardCenter = rect.left + rect.width / 2;
        var distance = clamp((cardCenter - midpoint) / Math.max(midpoint, 1), -1, 1);
        var focus = 1 - Math.min(1, Math.abs(distance));
        var entry = clamp(distance, 0, 1);
        var verticalProgress = clamp(((vh * 0.95) - rect.top) / Math.max(vh * 0.55, 1), 0, 1);
        var verticalEntry = 1 - verticalProgress;
        var slide = 74 * Math.max(entry, verticalEntry);
        var lift = -7 * focus;
        var rotate = distance * -0.14;
        card.classList.toggle('tt-product-card-spotlight', focus > 0.62);
        card.style.setProperty('--tt-card-parallax-x', slide.toFixed(2) + 'px');
        card.style.setProperty('--tt-card-parallax-y', lift.toFixed(2) + 'px');
        card.style.setProperty('--tt-card-parallax-rotate', rotate.toFixed(3) + 'deg');
      });
    }

    var ticking = false;
    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        update();
      });
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    if (window.lenis && typeof window.lenis.on === 'function') {
      try { window.lenis.on('scroll', requestUpdate); } catch (_) {}
    }

    requestUpdate();
    return true;
  }

  function initLiveDemoSection() {
    var section = document.querySelector('.section_perfom');
    if (!section) return true;
    if (section.dataset.ttLiveDemo === '1') return true;
    section.dataset.ttLiveDemo = '1';
    section.id = 'live-demo';
    section.classList.add('tt-live-demo-section');

    var isTerminalHost = /(^|\.)timelessterminal\.com$/i.test(window.location.hostname);
    var demoUrl = isTerminalHost
      ? '/api/demo/preview?redirect=%2Fterminal%3Ftab%3Dcommand'
      : 'https://timelessterminal.com/api/demo/preview?redirect=%2Fterminal%3Ftab%3Dcommand';
    section.classList.toggle('tt-live-demo-can-embed', isTerminalHost);
    section.innerHTML = [
      '<div class="tt-live-demo-shell">',
        '<div class="tt-live-demo-head">',
          '<div class="tt-live-demo-kicker"><span></span> LIVE TERMINAL DEMO</div>',
          '<h2>Try the terminal live.</h2>',
          '<p>Use a limited preview of Timeless Terminal before choosing a plan.</p>',
        '</div>',
        '<div class="tt-live-demo-preview" aria-label="Live Timeless Terminal demo">',
          '<div class="tt-live-demo-topbar">',
            '<div class="tt-live-demo-tabs">',
              '<span class="is-active">Command Center</span>',
              '<span>Markets</span>',
              '<span>Intel Feed</span>',
              '<span>Predictions</span>',
              '<span>CHRONOS AI</span>',
              '<span>Macro</span>',
            '</div>',
            '<div class="tt-live-demo-status"><i></i> Live</div>',
          '</div>',
          '<div class="tt-live-demo-screen">',
            '<iframe class="tt-live-demo-iframe" src="' + demoUrl + '" title="Timeless Terminal live demo" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>',
            '<div class="tt-live-demo-fallback">',
              '<div class="tt-live-demo-grid">',
                '<span></span><span></span><span></span><span></span><span></span><span></span>',
                '<span></span><span></span><span></span><span></span><span></span><span></span>',
              '</div>',
              '<div class="tt-live-demo-modal">',
                '<div class="tt-live-demo-lock">T</div>',
                '<h3>Launch live demo</h3>',
                '<p>The live terminal opens in a secure preview session.</p>',
                '<a href="' + demoUrl + '" target="_blank" rel="noopener">Open Terminal</a>',
              '</div>',
            '</div>',
          '</div>',
          '<div class="tt-live-demo-caption">LIVE DATA - LIMITED ACCESS - POWERED BY CHRONOS</div>',
        '</div>',
      '</div>'
    ].join('');
    return true;
  }

  function initMoreAboutTerminalSection() {
    var section = document.querySelector('.section_more');
    if (!section) return true;
    section.remove();
    return true;
  }

  function initOperatorProofSection() {
    var section = document.querySelector('.section_prove');
    if (!section) return true;
    if (section.dataset.ttOperatorProof === '1') return true;
    section.dataset.ttOperatorProof = '1';
    section.classList.remove('tt-operator-proof-section');
    section.classList.add('tt-testimonials-section');

    var testimonials = [
      {
        text: 'The edge is not more data. It is having the terminal turn noise into context before the market agrees.',
        name: 'Macro Operator',
        role: 'CHRONOS + AI Strategy',
        image: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      {
        text: 'CHRONOS makes macro feel actionable instead of scattered across charts, feeds, and notes.',
        name: 'Cross-Asset Trader',
        role: 'Macro desk',
        image: 'https://randomuser.me/api/portraits/men/75.jpg'
      },
      {
        text: 'AI Strategy feels like a research layer that remembers the market instead of resetting every session.',
        name: 'Private Investor',
        role: 'Strategy workflow',
        image: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      {
        text: "God's Eye gives me a live view of risk that I can actually use during the session.",
        name: 'Risk Analyst',
        role: 'Global intelligence',
        image: 'https://randomuser.me/api/portraits/men/46.jpg'
      },
      {
        text: 'The Trading Room connects chart review with macro context instead of separating the workflow.',
        name: 'Execution Trader',
        role: 'Trading Room',
        image: 'https://randomuser.me/api/portraits/women/68.jpg'
      },
      {
        text: 'Smart Money finally puts filings, capital rotation, and conviction into one operating view.',
        name: 'Portfolio Manager',
        role: '13F tracking',
        image: 'https://randomuser.me/api/portraits/men/62.jpg'
      },
      {
        text: 'It feels less like a dashboard and more like a command layer for finding conviction.',
        name: 'Crypto Analyst',
        role: 'Market intelligence',
        image: 'https://randomuser.me/api/portraits/women/12.jpg'
      },
      {
        text: 'The terminal helps me see what matters before it becomes obvious in the feed.',
        name: 'Active Trader',
        role: 'Daily workflow',
        image: 'https://randomuser.me/api/portraits/men/18.jpg'
      },
      {
        text: 'The value is speed: one place to observe, synthesize, decide, and execute.',
        name: 'Fund Researcher',
        role: 'Research process',
        image: 'https://randomuser.me/api/portraits/women/29.jpg'
      }
    ];

    function renderCard(item) {
      return [
        '<article class="tt-testimonial-card">',
          '<p>' + item.text + '</p>',
          '<div class="tt-testimonial-person">',
            '<span class="tt-testimonial-avatar">',
              '<img src="' + item.image + '" alt="' + item.name + '" loading="lazy">',
            '</span>',
            '<span>',
              '<strong>' + item.name + '</strong>',
              '<small>' + item.role + '</small>',
            '</span>',
          '</div>',
        '</article>'
      ].join('');
    }

    function renderColumn(items, modifier, duration) {
      var doubled = items.concat(items);
      return [
        '<div class="tt-testimonial-column ' + modifier + '" style="--tt-duration:' + duration + 's">',
          '<div class="tt-testimonial-track">',
            doubled.map(renderCard).join(''),
          '</div>',
        '</div>'
      ].join('');
    }

    var firstColumn = testimonials.slice(0, 3);
    var secondColumn = testimonials.slice(3, 6);
    var thirdColumn = testimonials.slice(6, 9);

    section.innerHTML = [
      '<div class="tt-testimonials-shell">',
        '<div class="tt-testimonials-head">',
          '<div class="tt-testimonials-pill">Testimonials</div>',
          '<h2>What our users say</h2>',
          '<p>How traders and investors describe Timeless Terminal as a live operating system for market intelligence.</p>',
        '</div>',
        '<div class="tt-testimonials-columns" aria-label="Timeless Terminal testimonials">',
          renderColumn(firstColumn, 'is-one', 18),
          renderColumn(secondColumn, 'is-two', 23),
          renderColumn(thirdColumn, 'is-three', 20),
        '</div>',
        '<div class="tt-testimonials-note">Early user feedback. Names withheld while users remain private.</div>',
      '</div>'
    ].join('');
    return true;
  }

  function initSiteCoherenceCleanup() {
    var email = 'timelessterminal@proton.me';

    var genericWhySection = document.querySelector('.section_why');
    if (genericWhySection) genericWhySection.remove();

    function textOf(el) {
      return (el.textContent || '').replace(/\s+/g, ' ').trim();
    }

    function normalizeInternalHash(a, hash) {
      if (!a) return;
      a.setAttribute('href', hash);
    }

    var productsHeading = Array.prototype.slice.call(document.querySelectorAll('h1,h2,h3,h4,.products_heading,.text-block'))
      .find(function (el) { return /^our products$/i.test(textOf(el)); });
    var productsSection = productsHeading && (productsHeading.closest('section') || productsHeading.closest('[class*="section_"]') || productsHeading.closest('.main-wrapper > div'));
    if (productsSection && !document.getElementById('features')) productsSection.id = 'features';

    var pricingSection = document.getElementById('pricing') || Array.prototype.slice.call(document.querySelectorAll('section,[class*="section_"]'))
      .find(function (el) { return /pricing|choose your plan|subscription|monthly|quarterly|yearly/i.test(textOf(el).slice(0, 900)); });
    if (pricingSection && !pricingSection.id) pricingSection.id = 'pricing';

    document.querySelectorAll('.nav_bottom-wrap').forEach(function (wrap) {
      if (!/727-544|727-545|6300 46th|St\. Petersburg|Mozart/i.test(textOf(wrap)) && !wrap.querySelector('.mozart-logo')) return;
      wrap.innerHTML = [
        '<div class="nav_bottom-content">',
          '<div class="nav_title">Contact Timeless</div>',
          '<a href="mailto:' + email + '" class="nav-link-contact w-nav-link">' + email + '</a>',
        '</div>',
        '<div class="nav_bottom-content">',
          '<div class="nav_title">Terminal Access</div>',
          '<a href="#live-demo" class="nav-link-contact w-nav-link">Watch Live Demo</a>',
          '<a href="#pricing" class="nav-link-contact w-nav-link">View Pricing</a>',
        '</div>'
      ].join('');
    });

    document.querySelectorAll('a[href*="mozartcompany.com"], .mozart-logo, a[href*="maps.app.goo.gl/oh48tFuELFMpZQun6"]').forEach(function (el) {
      el.remove();
    });

    document.querySelectorAll('a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var label = textOf(a).toLowerCase();

      if (href === '#discover' || href === '/#discover') normalizeInternalHash(a, '#features');
      if (href === '/#features') normalizeInternalHash(a, '#features');
      if (href === '/#about') normalizeInternalHash(a, '#about');
      if ((href === '#dashboard' || href === '/#dashboard') && label.indexOf('about') !== -1) normalizeInternalHash(a, '#about');

      if (/727-544|727-545|6300 46th|St\. Petersburg|Fax:/i.test(textOf(a))) {
        a.setAttribute('href', 'mailto:' + email);
        a.textContent = email;
      }

      if (href === '#') {
        if (label.indexOf('login') !== -1) {
          a.setAttribute('href', '/form');
        } else if (label.indexOf('contact') !== -1) {
          a.setAttribute('href', 'mailto:' + email);
        } else if (label.indexOf('live demo') !== -1 || label.indexOf('demo') !== -1) {
          a.setAttribute('href', '#live-demo');
        } else if (label.indexOf('website by') !== -1 || label.indexOf('eloqwnt') !== -1) {
          a.removeAttribute('href');
          a.setAttribute('aria-disabled', 'true');
        } else {
          a.setAttribute('href', '/form');
        }
      }
    });

    try {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      var node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue.indexOf('Trands') !== -1) node.nodeValue = node.nodeValue.replace(/Trands/g, 'Trends');
      }
    } catch (_) {}

    document.querySelectorAll('img, source').forEach(function (el) {
      ['src', 'srcset'].forEach(function (attr) {
        var value = el.getAttribute(attr);
        if (!value) return;
        el.setAttribute(attr, value.replace(/%252520/g, '%2520'));
      });
    });

    return true;
  }

  function initAccessFormFallback() {
    var form = document.getElementById('email-form');
    if (!form || form.dataset.ttFallbackReady === 'true') return true;

    form.dataset.ttFallbackReady = 'true';
    form.setAttribute('method', 'post');
    form.setAttribute('action', 'mailto:timelessterminal@proton.me');
    form.setAttribute('enctype', 'text/plain');

    form.addEventListener('submit', function (event) {
      if (form.checkValidity && !form.checkValidity()) {
        return;
      }

      event.preventDefault();

      var name = (form.querySelector('[name="name"]') || {}).value || '';
      var email = (form.querySelector('[name="email"]') || {}).value || '';
      var phone = (form.querySelector('[name="Phone"]') || {}).value || '';
      var subject = 'Timeless Terminal access request';
      var body = [
        'New access request from the Timeless Terminal landing page.',
        '',
        'Name: ' + name.trim(),
        'Email: ' + email.trim(),
        'Phone: ' + phone.trim()
      ].join('\n');

      window.location.href = 'mailto:timelessterminal@proton.me?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });

    return true;
  }

  function initPricingSystem() {
    var section = document.getElementById('pricing');
    if (!section || section.dataset.ttPricingReady === 'true') return true;

    section.dataset.ttPricingReady = 'true';
    section.classList.add('tt-pricing-system');

    var plans = [
      {
        name: 'Free',
        badge: 'Preview',
        price: 'Free',
        period: '',
        summary: 'A limited live window into the terminal before choosing a plan.',
        cta: 'Watch Live Demo',
        href: '#live-demo',
        features: ['5 min daily live demo', 'Command Center sample', 'Market context snapshot', 'No subscription required'],
        bestFor: 'First look'
      },
      {
        name: 'Student',
        badge: 'Learner',
        price: '$99',
        period: '/mo',
        summary: 'Foundational intelligence for serious learners building market discipline.',
        cta: 'Get Started',
        href: '/form',
        features: ['7 modules included', 'Command Center (crypto)', 'Markets & live prices', 'Market updates', 'CHRONOS Chat', 'Trade Desk', 'AI Strategist', 'Intel Feed'],
        bestFor: 'Learning market structure'
      },
      {
        name: 'Pro',
        badge: 'Most popular',
        price: '$199',
        period: '/mo',
        summary: 'The full analytical suite for professional traders.',
        cta: 'Go Pro',
        href: '/form',
        features: ['Everything in Student', '14 modules included', 'Command Center (stocks + crypto)', 'Macro Dashboard', 'Execute (live trading)', 'Heatmap & Monitor', 'Binance & Hyperliquid', 'Intelligence Module'],
        bestFor: 'Daily decision-making',
        featured: true
      },
      {
        name: 'Institutional',
        badge: 'Sovereign tier',
        price: 'By Application',
        period: '',
        summary: 'The sovereign stack. Reserved for serious capital.',
        cta: 'Private Access',
        href: '/form',
        features: ['Everything in Pro', '19 modules included', 'God\'s Eye Surveillance', 'Predictions (Polymarket)', 'Game Theory (DPIE)', 'Deep Forecast Engine', 'Smart Money Tracking', 'World Memory'],
        bestFor: 'Serious capital',
        application: true
      }
    ];

    var rows = [
      ['Live demo', true, true, true, true],
      ['Included modules', 'Preview only', '7 modules', '14 modules', '19 modules'],
      ['AI Strategist', false, true, true, true],
      ['CHRONOS Chat', 'Preview', true, true, true],
      ['Macro Dashboard', false, false, true, true],
      ['Execute / live trading', false, false, true, true],
      ['God\'s Eye', false, false, false, true],
      ['Smart Money Tracking', false, false, false, true],
      ['Best for', 'Trying the terminal', 'Learning', 'Professional traders', 'Serious capital']
    ];

    function icon(value) {
      if (value === true) return '<span class="tt-pricing-check" aria-label="Included"></span>';
      if (value === false) return '<span class="tt-pricing-minus" aria-label="Not included"></span>';
      return '<span>' + value + '</span>';
    }

    function planCard(plan, index) {
      return [
        '<article class="tt-pricing-card' + (plan.featured ? ' is-featured' : '') + (plan.application ? ' is-application' : '') + '" style="--delay:' + (index * 80) + 'ms">',
          '<div class="tt-pricing-card-inner">',
            '<div class="tt-pricing-card-top">',
              '<div class="tt-pricing-orb">' + (index + 1).toString().padStart(2, '0') + '</div>',
              '<span>' + plan.badge + '</span>',
            '</div>',
            '<h3>' + plan.name + '</h3>',
            '<div class="tt-pricing-price"><strong>' + plan.price + '</strong><small>' + plan.period + '</small></div>',
            '<p>' + plan.summary + '</p>',
            '<a class="tt-pricing-button" href="' + plan.href + '">' + plan.cta + '<span>-></span></a>',
            '<div class="tt-pricing-features">',
              '<span>Includes</span>',
              '<ul>',
                plan.features.map(function (feature) {
                  return '<li><i></i>' + feature + '</li>';
                }).join(''),
              '</ul>',
            '</div>',
            '<div class="tt-pricing-best">' + plan.bestFor + '</div>',
          '</div>',
        '</article>'
      ].join('');
    }

    section.innerHTML = [
      '<div class="tt-pricing-shell">',
        '<div class="tt-pricing-head">',
          '<div>',
            '<span class="tt-pricing-eyebrow">Pricing</span>',
            '<h2>Choose the access level for your workflow.</h2>',
          '</div>',
          '<p>Start with a live preview, then unlock the intelligence layers your process needs: AI Strategy, CHRONOS, God\'s Eye, Smart Money, and execution.</p>',
        '</div>',
        '<div class="tt-pricing-grid">',
          plans.map(planCard).join(''),
        '</div>',
        '<div class="tt-pricing-compare" aria-label="Plan comparison">',
          '<div class="tt-pricing-compare-head">',
            '<span>Compare access</span>',
            '<small>Clear differences between each subscription.</small>',
          '</div>',
          '<div class="tt-pricing-table-wrap">',
            '<table class="tt-pricing-table">',
              '<thead><tr><th>Feature</th>' + plans.map(function (plan) { return '<th>' + plan.name + '</th>'; }).join('') + '</tr></thead>',
              '<tbody>',
                rows.map(function (row) {
                  return '<tr><td>' + row[0] + '</td>' + row.slice(1).map(function (value) { return '<td>' + icon(value) + '</td>'; }).join('') + '</tr>';
                }).join(''),
              '</tbody>',
            '</table>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    return true;
  }

  function initTeamAboutSection() {
    if (document.querySelector('.tt-team-section')) return true;
    var after = document.querySelector('.tt-testimonials-section') || document.querySelector('.section_prove');
    if (!after || !after.parentNode) return false;

    var section = document.createElement('section');
    section.id = 'about';
    section.className = 'tt-team-section';

    var people = [
      {
        image: '/custom/team/pedro-teixeira.png',
        name: 'Pedro Teixeira',
        role: 'Founder',
        text: 'Created Timeless Terminal and defines the product vision, intelligence logic, and market operating system.'
      },
      {
        image: '/custom/team/diogo-inacio.png',
        name: 'Diogo Inacio',
        role: 'Operations & Execution',
        text: 'Turns the vision into execution, coordinating workflows, product decisions, and day-to-day implementation.'
      },
      {
        image: '/custom/team/bruno-santos.png',
        name: 'Bruno Santos',
        role: 'Technology Lead',
        text: 'Leads the technical build behind the terminal, from product infrastructure to system reliability.'
      }
    ];

    section.innerHTML = [
      '<div class="tt-team-shell">',
        '<div class="tt-team-head">',
          '<div class="tt-team-pill">About</div>',
          '<p class="tt-team-kicker">THE TEAM BEHIND TIMELESS TERMINAL</p>',
          '<h2>Built by the people turning market intelligence into an operating system.</h2>',
          '<p>A focused team combining product vision, execution discipline, and technical architecture to build one terminal for intelligence, strategy, and action.</p>',
        '</div>',
        '<div class="tt-team-board">',
          '<article class="tt-team-mission">',
            '<span>Our operating principle</span>',
            '<h3>Fragmented signals should become conviction before the market agrees.</h3>',
            '<p>Timeless Terminal is built around a simple belief: traders and investors should not jump between disconnected dashboards, feeds, and notes to understand what matters.</p>',
          '</article>',
          people.map(function (person, index) {
            return [
              '<article class="tt-team-card tt-team-person tt-team-person-' + (index + 1) + '" style="--delay:' + (index * 100 + 120) + 'ms">',
                '<div class="tt-team-photo">',
                  '<img src="' + person.image + '" alt="' + person.name + '" loading="lazy">',
                '</div>',
                '<div class="tt-team-card-copy">',
                  '<h3>' + person.name + '</h3>',
                  '<span>' + person.role + '</span>',
                  '<p>' + person.text + '</p>',
                '</div>',
              '</article>'
            ].join('');
          }).join(''),
        '</div>',
        '<div class="tt-team-note">Built privately. Operating publicly through the terminal.</div>',
      '</div>'
    ].join('');

    after.parentNode.insertBefore(section, after.nextSibling);
    return true;
  }

  function tick() {
    var a = run();
    var b = runSubtitle();
    var c = joinNow();
    var d = initNavScroll();
    var e = scrubLegacyBranding();
    var f = initHeroSignals();
    var g = initSummaryReveal();
    var h = stabilizeProductCards();
    var i = initProductLaptopMotion();
    var j = initLiveDemoSection();
    var k = initOperatorProofSection();
    var l = initSiteCoherenceCleanup();
    var m = initTeamAboutSection();
    var n = initMoreAboutTerminalSection();
    var o = initAccessFormFallback();
    var p = initPricingSystem();
    return a && b && c && d && e && f && g && h && i && j && k && l && m && n && o && p;
  }

  if (document.readyState !== 'loading') tick();
  document.addEventListener('DOMContentLoaded', tick);
  window.addEventListener('load', tick);

  // catch the nodes the instant React inserts them (avoids a flash)
  try {
    var mo = new MutationObserver(function () { if (tick()) mo.disconnect(); });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(function () { try { mo.disconnect(); } catch (_) {} }, 6000);
  } catch (_) {}

  [200, 700, 1500, 3000].forEach(function (t) { setTimeout(tick, t); });
  setTimeout(safetyReveal, 4000);
})();
