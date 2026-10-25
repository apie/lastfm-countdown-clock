const STORAGE_KEY = 'lastfm-username';
const pad = (n) => String(n).padStart(2, '0');

function renderTimes(root) {
  root.querySelectorAll('time[data-format]').forEach((el) => {
    const date = new Date(el.getAttribute('datetime'));
    el.textContent = el.dataset.format === 'date'
      ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  });
}

function tick() {
  document.querySelectorAll('[data-countdown]').forEach((el) => {
    const diff = new Date(el.dataset.countdown).getTime() - Date.now();
    if (diff <= 0) {
      el.className = 'countdown';
      el.innerHTML = '<div class="happening-now" style="grid-column: 1 / -1">The event is happening now!</div>';
      delete el.dataset.countdown;
      return;
    }
    const values = {
      days: Math.floor(diff / 86400000),
      hours: Math.floor(diff / 3600000) % 24,
      minutes: Math.floor(diff / 60000) % 60,
      seconds: Math.floor(diff / 1000) % 60,
    };
    for (const [unit, value] of Object.entries(values)) {
      el.querySelector(`[data-unit=${unit}]`).textContent = pad(value);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('username-form');
  const input = form.elements.username;
  if (!input.value) input.value = localStorage.getItem(STORAGE_KEY) || '';
  if (input.value.trim()) htmx.trigger(form, 'submit');
  setInterval(tick, 1000);
});

document.addEventListener('htmx:configRequest', (e) => {
  const username = e.detail.parameters.username;
  if (username) localStorage.setItem(STORAGE_KEY, username);
});

document.addEventListener('htmx:afterSwap', (e) => {
  renderTimes(e.target);
  tick();
});

document.addEventListener('htmx:responseError', (e) => {
  e.detail.target.innerHTML = '<div class="card fallback"><p class="error">Failed to fetch events. Please check the username and try again.</p></div>';
});
