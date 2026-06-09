// NZ Gateway — Events pages interactions

// ---------- Scroll reveal ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// ---------- Animated counters ----------
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      animateCount(e.target);
      countObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

// ---------- Events listing: city/mode filter ----------
const grid = document.getElementById('eventsGrid');
if (grid) {
  const chips = document.querySelectorAll('.chip');
  const cards = grid.querySelectorAll('.event-card');
  const noEvents = document.getElementById('noEvents');
  let activeCity = 'all';
  let activeMode = null;

  function applyFilter() {
    let shown = 0;
    cards.forEach((card) => {
      const cities = card.dataset.cities.split(' ');
      const cityOk = activeCity === 'all' || cities.includes(activeCity);
      const modeOk = !activeMode || card.dataset.mode === activeMode;
      const show = cityOk && modeOk;
      card.style.display = show ? '' : 'none';
      if (show) shown++;
    });
    if (noEvents) noEvents.style.display = shown ? 'none' : 'block';
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      if (chip.dataset.city) {
        document.querySelectorAll('.chip[data-city]').forEach((c) => c.classList.remove('on'));
        chip.classList.add('on');
        activeCity = chip.dataset.city;
      } else if (chip.dataset.mode) {
        const wasOn = chip.classList.contains('on');
        document.querySelectorAll('.chip[data-mode]').forEach((c) => c.classList.remove('on'));
        if (!wasOn) chip.classList.add('on');
        activeMode = wasOn ? null : chip.dataset.mode;
      }
      applyFilter();
    });
  });
}

// ---------- Detail page: city selection ----------
const registerBtn = document.getElementById('registerBtn');
const eventKey = (registerBtn && registerBtn.dataset.event) ? registerBtn.dataset.event : 'roadshow';
function syncRegisterLink(city) {
  if (!registerBtn) return;
  registerBtn.setAttribute('href', 'register.html?event=' + eventKey + '&city=' + encodeURIComponent(city));
  registerBtn.innerHTML = 'Register for ' + city + ' — It\'s Free <i class="fa-solid fa-arrow-right"></i>';
}
const cityOptions = document.querySelectorAll('.city-option');
cityOptions.forEach((opt) => {
  opt.addEventListener('click', () => {
    cityOptions.forEach((o) => o.classList.remove('selected'));
    opt.classList.add('selected');
    syncRegisterLink(opt.dataset.city);
  });
});

// ---------- Detail page: review slider ----------
const reviews = [
  '"The team made the entire process simple and transparent. Their guidance helped me make the right decision."',
  '"I received answers to questions I couldn\'t find anywhere else. The consultation gave me confidence."',
  '"From university selection to visa support, the team was with me at every step."'
];
const reviewText = document.getElementById('reviewText');
const reviewDots = document.getElementById('reviewDots');
if (reviewText && reviewDots) {
  let current = 0;
  let timer;

  reviews.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' on' : '');
    dot.setAttribute('aria-label', 'Review ' + (i + 1));
    dot.addEventListener('click', () => { show(i); restart(); });
    reviewDots.appendChild(dot);
  });
  const dots = reviewDots.querySelectorAll('.dot');

  function show(i) {
    current = i;
    reviewText.style.opacity = 0;
    setTimeout(() => {
      reviewText.textContent = reviews[i];
      reviewText.style.transition = 'opacity 0.4s ease';
      reviewText.style.opacity = 1;
    }, 250);
    dots.forEach((d, di) => d.classList.toggle('on', di === i));
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => show((current + 1) % reviews.length), 5000);
  }
  restart();
}

// ---------- Detail page: FAQ accordion ----------
document.querySelectorAll('.faq-item').forEach((item) => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach((o) => {
      o.classList.remove('open');
      o.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});
