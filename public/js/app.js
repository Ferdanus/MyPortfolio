document.addEventListener('DOMContentLoaded', function () {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // Ignore any #hash in the URL and always land at the very top
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  window.scrollTo(0, 0);

  var userNameEl = document.getElementById('user-name');
  if (userNameEl) {
    userNameEl.textContent = 'Fajriasa Erdanus';
  }

  setupMobileMenu();
  setupScrollAnimations();
  setupNavHighlight();
  setupNavbarScroll();
  typeHeroSubtitle();
  setupCounterAnimation();
  fetchSkills();
  fetchProjects();
});

function setupNavbarScroll() {
  var navbar = document.querySelector('.navbar');
  if (!navbar) return;

  var ticking = false;
  var isScrolled = false;
  var ON_THRESHOLD = 80;
  var OFF_THRESHOLD = 40;

  function updateNavbar() {
    if (!isScrolled && window.scrollY > ON_THRESHOLD) {
      isScrolled = true;
      navbar.classList.add('scrolled');
    } else if (isScrolled && window.scrollY < OFF_THRESHOLD) {
      isScrolled = false;
      navbar.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  updateNavbar();
}

function setupMobileMenu() {
  var toggle = document.getElementById('menu-toggle');
  var nav = document.getElementById('nav-links');
  var overlay = document.getElementById('nav-overlay');
  if (!toggle || !nav) return;

  function closeMenu() {
    nav.classList.remove('open');
    toggle.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
  }

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    if (overlay) overlay.classList.toggle('open', isOpen);
  });

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });
}

/**
 * Reveals each .animate-section using the animation named in its
 * data-animate attribute (slide-left / slide-right / fade-scale),
 * triggered once the section scrolls into view.
 */
function setupScrollAnimations() {
  var sections = document.querySelectorAll('.animate-section');
  if (!sections.length) return;

  sections.forEach(function (section) {
    var animType = section.getAttribute('data-animate') || 'fade-scale';
    section.classList.add(animType);
  });

  if (!('IntersectionObserver' in window)) {
    sections.forEach(function (section) {
      section.classList.add('visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // reveal once, then stop watching
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
);

  sections.forEach(function (section) {
    observer.observe(section);
  });
}

/**
 * Types out the hero subtitle character by character, leaving the
 * existing .typing-cursor span in place after the text.
 */
function typeHeroSubtitle() {
  var el = document.getElementById('hero-subtitle');
  if (!el) return;

  var cursor = el.querySelector('.typing-cursor');
  var fullText = el.textContent.trim();

  var textSpan = document.createElement('span');
  el.textContent = '';
  el.appendChild(textSpan);

  if (!cursor) {
    cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
  }
  el.appendChild(cursor);

  var i = 0;
  function typeChar() {
    if (i <= fullText.length) {
      textSpan.textContent = fullText.slice(0, i);
      i++;
      setTimeout(typeChar, 35);
    }
  }
  typeChar();
}

/**
 * Animates each [data-count] number (used inside the About stats)
 * counting up from 0 once it scrolls into view.
 */
function setupCounterAnimation() {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1200;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var value = Math.floor(progress * target);
      el.textContent = value + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(function (el) {
    observer.observe(el);
  });
}

function setupNavHighlight() {
  var sections = document.querySelectorAll('section[id]');
  var links = document.querySelectorAll('.nav-links a');
  var highlight = document.getElementById('nav-highlight');
  var underline = document.getElementById('nav-underline');
  var mainNavEl = document.getElementById('main-nav');

  var isManualNav = false;
  var manualNavTimeout;

  function movePillToLink(link) {
    if (!link || !mainNavEl) return;
    if (window.innerWidth <= 768) return; // pill/underline are desktop-only affordances
    var linkRect = link.getBoundingClientRect();
    var navRect = mainNavEl.getBoundingClientRect();
    var offsetLeft = linkRect.left - navRect.left;

    if (highlight) {
      highlight.style.width = linkRect.width + 'px';
      highlight.style.transform = 'translateX(' + offsetLeft + 'px)';
      highlight.classList.add('ready');
    }

    if (underline) {
      var underlineWidth = linkRect.width * 0.5;
      var underlineOffset = offsetLeft + (linkRect.width - underlineWidth) / 2;
      underline.style.width = underlineWidth + 'px';
      underline.style.transform = 'translateX(' + underlineOffset + 'px)';
      underline.classList.add('ready');
    }
  }

  function setActiveLink(link) {
    links.forEach(function (l) {
      l.classList.toggle('active', l === link);
    });
    movePillToLink(link);
  }

  function updateActiveLink() {
    if (isManualNav) return; // don't fight a click-triggered scroll

    var scrollY = window.scrollY;
    var windowHeight = window.innerHeight;

    // If we're at (or very near) the top, Home always wins — regardless
    // of which section's center is technically closest.
    if (scrollY < 10) {
      var homeLink = document.querySelector('.nav-links a[href="#home"]');
      if (homeLink) setActiveLink(homeLink);
      return;
    }

    var bestSectionId = null;
    var bestRatio = -1;
    sections.forEach(function (section) {
      var id = section.getAttribute('id');
      if (!id || !links.length) return;
      var rect = section.getBoundingClientRect();
      var sectionTop = rect.top + scrollY;
      var sectionHeight = rect.height;
      var viewportCenter = scrollY + windowHeight / 2;
      var sectionCenter = sectionTop + sectionHeight / 2;
      var distance = Math.abs(viewportCenter - sectionCenter);
      var maxDistance = windowHeight / 2;
      var ratio = 1 - (distance / maxDistance);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestSectionId = id;
      }
    });

    var activeLink = null;
    links.forEach(function (link) {
      if (link.getAttribute('href') === '#' + bestSectionId) activeLink = link;
    });
    if (activeLink) setActiveLink(activeLink);
  }

  // Click handling: scroll manually, force the clicked link active right away,
  // and hold that state until the smooth scroll has settled.
  links.forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = link.getAttribute('href').slice(1);
      var targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      e.preventDefault();

      isManualNav = true;
      clearTimeout(manualNavTimeout);
      setActiveLink(link);

      if (targetId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Release control back to scroll-tracking once the smooth scroll
      // has had time to finish.
      manualNavTimeout = setTimeout(function () {
        isManualNav = false;
        updateActiveLink();
      }, 900);
    });
  });

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateActiveLink);
  updateActiveLink();
}

/**
 * Loads skills from /api/skills, falling back to a built-in list
 * if the endpoint isn't available yet.
 */
function fetchSkills() {
  var container = document.getElementById('skills-container');
  if (!container) return;

var fallbackSkills = [
  { name: 'HTML', category: 'Frontend', icon: '/src/img/html.png', level: 'advanced' },
  { name: 'CSS', category: 'Frontend', icon: '/src/img/css.png', level: 'advanced' },
  { name: 'JavaScript', category: 'Frontend', icon: '/src/img/js.png', level: 'advanced' },
  { name: 'PHP', category: 'Backend', icon: '/src/img/php.png', level: 'intermediate' },
  { name: 'MySQL', category: 'Database', icon: '/src/img/mysql.png', level: 'intermediate' },
  { name: 'Adobe Premiere', category: 'Design', icon: '/src/img/premiere.png', level: 'intermediate' },
  { name: 'CapCut', category: 'Design', icon: '/src/img/capcut.png', level: 'advanced' },
  { name: 'Canva', category: 'Design', icon: '/src/img/canva.png', level: 'advanced' },
  { name: 'Word', category: 'Office', icon: '/src/img/word.png', level: 'advanced' },
  { name: 'Excel', category: 'Office', icon: '/src/img/excel.png', level: 'advanced' },
];

  fetch('/api/skills')
    .then(function (res) {
      if (!res.ok) throw new Error('Request failed');
      return res.json();
    })
    .then(function (data) {
      renderSkills(container, Array.isArray(data) && data.length ? data : fallbackSkills);
    })
    .catch(function () {
      renderSkills(container, fallbackSkills);
    });
}

function renderSkills(container, skills) {
  container.innerHTML = skills.map(function (skill) {
    var level = skill.level || 'intermediate';
    return (
      '<div class="skill-card">' +
        '<div class="skill-icon"><img src="' + skill.icon + '" alt="' + escapeHTML(skill.name) + '" loading="lazy"></div>' +
        '<div class="skill-name">' + escapeHTML(skill.name) + '</div>' +
        '<div class="skill-category">' + escapeHTML(skill.category || '') + '</div>' +
        '<span class="skill-level level-' + level + '">' + level + '</span>' +
      '</div>'
    );
  }).join('');
}

/**
 * Loads projects from /api/projects, falling back to a built-in
 * list if the endpoint isn't available yet.
 */
function fetchProjects() {
  var container = document.getElementById('projects-container');
if (!container) return;

var fallbackProjects = [
  {
    name: 'CthllyX Gallery',
    description: 'Website galeri untuk menampilkan koleksi foto/karya secara online.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    status: 'completed',
    image: '/src/img/web1.png',
    link: 'https://cthllyx-gallery.vercel.app/'
  },
  {
    name: 'Desa Profile',
    description: 'Website profil desa untuk menampilkan informasi dan data desa.',
    tech: ['HTML', 'CSS', 'JavaScript'],
    status: 'completed',
    image: '/src/img/web2.png',
    link: 'https://desa-profile.vercel.app/'
  },
  {
    name: 'Web Alumni SDN 1 Pengadilan',
    description: 'Website Pengelolaan Siswa Alumni SDN 1 Pengadilan.',
    tech: ['PHP', 'HTML', 'CSS', 'JavaScript', 'SQL'],
    status: 'completed',
    image: '/src/img/web3.png',
    link: 'https://sdn1pengadilan.wuaze.com/'
  }
];

  fetch('/api/projects')
    .then(function (res) {
      if (!res.ok) throw new Error('Request failed');
      return res.json();
    })
    .then(function (data) {
      renderProjects(container, Array.isArray(data) && data.length ? data : fallbackProjects);
    })
    .catch(function () {
      renderProjects(container, fallbackProjects);
    });
}

var techIcons = {
  'HTML': '/src/img/html.png',
  'CSS': '/src/img/css.png',
  'JavaScript': '/src/img/js.png',
  'PHP': '/src/img/php.png',
  'SQL': '/src/img/mysql.png'
};

function renderProjects(container, projects) {
  container.innerHTML = projects.map(function (project) {
    var statusClass = project.status === 'in-progress' ? 'status-in-progress' : 'status-completed';
    var statusLabel = project.status === 'in-progress' ? 'In Progress' : 'Completed';
    var tech = (project.tech || []).map(function (t) {
      var iconSrc = techIcons[t];
      var iconTag = iconSrc ? '<img src="' + iconSrc + '" alt="">' : '';
      return '<span>' + iconTag + escapeHTML(t) + '</span>';
    }).join('');

    var thumb = project.image
      ? '<div class="thumb"><img src="' + project.image + '" alt="' + escapeHTML(project.name) + '" loading="lazy"></div>'
      : '';

    var linkWrap = project.link
      ? '<a href="' + project.link + '" target="_blank" rel="noopener noreferrer" class="project-link-wrap">'
      : '<div class="project-link-wrap">';
    var linkClose = project.link ? '</a>' : '</div>';

    return (
      linkWrap +
      '<div class="project-card">' +
        thumb +
        '<div class="card-body">' +
          '<h3>' + escapeHTML(project.name) + '</h3>' +
          '<p class="description">' + escapeHTML(project.description || '') + '</p>' +
          '<div class="tech">' + tech + '</div>' +
          '<div class="status ' + statusClass + '">' + statusLabel + '</div>' +
        '</div>' +
      '</div>' +
      linkClose
    );
  }).join('');
}

function setupContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var submitBtn = document.getElementById('submit-btn');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      message: document.getElementById('message').value.trim()
    };

    if (!formData.name || !formData.email || !formData.message) {
      showFormMessage('Please fill in all fields.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';
    }

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        if (result.success) {
          showFormMessage('Message sent successfully! I will get back to you soon.', 'success');
          form.reset();
        } else {
          showFormMessage(result.error || 'Failed to send message. Please try again.', 'error');
        }
      })
      .catch(function () {
        showFormMessage('Network error. Please check your connection and try again.', 'error');
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Send Message</span>';
        }
      });
  });
}

function showFormMessage(message, type) {
  var el = document.getElementById('form-message');
  if (!el) return;

  el.textContent = message;
  el.className = 'form-message ' + type;
  el.style.display = 'block';

  setTimeout(function () {
    el.style.display = 'none';
  }, 6000);
}

function escapeHTML(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}