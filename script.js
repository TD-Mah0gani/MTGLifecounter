let p1Life = 40;
let p2Life = 40;

function updateDisplay() {
  document.getElementById('p1-life').textContent = p1Life;
  document.getElementById('p2-life').textContent = p2Life;
}

document.addEventListener('click', (event) => {
  const btn = event.target;
  if (btn.tagName !== 'BUTTON') return;

  const player = btn.dataset.player;

  if (btn.dataset.reset) {
    if (player === '1') p1Life = 40;
    if (player === '2') p2Life = 40;
  } else {
    const change = Number(btn.dataset.change);
    if (player === '1') p1Life += change;
    if (player === '2') p2Life += change;
  }

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .catch(console.error);
}


  updateDisplay();
});

updateDisplay();
