document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('qr-form');
  const result = document.getElementById('qr-result');
  const historyDiv = document.getElementById('qr-history');
  const HISTORY_KEY = 'qrHistory';

  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  history.forEach(item => addHistoryItem(item));

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = document.getElementById('qr-text').value.trim();
    const color = document.getElementById('qr-color').value.replace('#', '');
    const bg = document.getElementById('qr-bg').value.replace('#', '');
    const size = document.getElementById('qr-size').value;

    if (!text) return;
    if (history.some(h => h.text === text)) {
      alert('El código ya existe en el historial');
      return;
    }

    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${color}&bgcolor=${bg}`;

    const img = document.createElement('img');
    img.src = url;
    img.alt = text;
    result.innerHTML = '';
    result.appendChild(img);

    const entry = { text, color, bg, size, url, created: new Date().toISOString() };
    history.push(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    addHistoryItem(entry);
  });

  function addHistoryItem(item) {
    const wrapper = document.createElement('div');
    wrapper.className = 'history-item';

    const img = document.createElement('img');
    img.src = item.url || `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(item.text)}&color=${item.color}&bgcolor=${item.bg}`;
    img.alt = item.text;
    wrapper.appendChild(img);

    const caption = document.createElement('p');
    caption.textContent = item.text;
    wrapper.appendChild(caption);

    historyDiv.appendChild(wrapper);
  }
});
