// -----------------------------
// LIFE TOTALS (LOCAL STORAGE)
// -----------------------------
let p1Life = Number(localStorage.getItem('p1Life')) || 40;
let p2Life = Number(localStorage.getItem('p2Life')) || 40;

let p1Life4 = Number(localStorage.getItem('p1Life4')) || 40;
let p2Life4 = Number(localStorage.getItem('p2Life4')) || 40;
let p3Life4 = Number(localStorage.getItem('p3Life4')) || 40;
let p4Life4 = Number(localStorage.getItem('p4Life4')) || 40;


// -----------------------------
// UPDATE DISPLAY
// -----------------------------
function updateDisplay() {
  // 2-player
  document.getElementById('p1-life').textContent = p1Life;
  document.getElementById('p2-life').textContent = p2Life;

  // 4-player
  document.getElementById('p1-life-4').textContent = p1Life4;
  document.getElementById('p2-life-4').textContent = p2Life4;
  document.getElementById('p3-life-4').textContent = p3Life4;
  document.getElementById('p4-life-4').textContent = p4Life4;
}


// -----------------------------
// BUTTON CLICK HANDLER
// -----------------------------
document.addEventListener('click', (event) => {
  const btn = event.target;
  if (btn.tagName !== 'BUTTON') return;

  const player = btn.dataset.player;

  function saveAll() {
    localStorage.setItem('p1Life', p1Life);
    localStorage.setItem('p2Life', p2Life);

    localStorage.setItem('p1Life4', p1Life4);
    localStorage.setItem('p2Life4', p2Life4);
    localStorage.setItem('p3Life4', p3Life4);
    localStorage.setItem('p4Life4', p4Life4);
  }

  // RESET BUTTON
  if (btn.dataset.reset) {

    // 2-player resets
    if (player === '1') p1Life = 40;
    if (player === '2') p2Life = 40;

    // 4-player resets
    if (player === 'p1') p1Life4 = 40;
    if (player === 'p2') p2Life4 = 40;
    if (player === 'p3') p3Life4 = 40;
    if (player === 'p4') p4Life4 = 40;

    saveAll();

  } else if (btn.dataset.change) {

    const change = Number(btn.dataset.change);

    // 2-player changes
    if (player === '1') p1Life += change;
    if (player === '2') p2Life += change;

    // 4-player changes
    if (player === 'p1') p1Life4 += change;
    if (player === 'p2') p2Life4 += change;
    if (player === 'p3') p3Life4 += change;
    if (player === 'p4') p4Life4 += change;

    saveAll();
  }

  updateDisplay();
});


// -----------------------------
// SERVICE WORKER
// -----------------------------
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .catch(console.error);
}


// -----------------------------
// MODE SWITCHING (NOW IN MENU)
// -----------------------------
const twoPlayerDiv = document.getElementById('two-player');
const fourPlayerDiv = document.getElementById('four-player');
const toggleBtn = document.getElementById('toggle-mode');


// -----------------------------
// MENU BUTTON + POPUP (OPTION B FIX)
// -----------------------------
const menuPanel = document.getElementById('menu-panel');
const closeMenu = document.getElementById('close-menu');

// Listen to BOTH menu buttons:
// - The main one: id="menu-btn"
// - Any duplicates: class="menu-btn"
document.querySelectorAll('#menu-btn, .menu-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    menuPanel.classList.remove('hidden');
  });
});

// Close menu
closeMenu.addEventListener('click', () => {
  menuPanel.classList.add('hidden');
});


// -----------------------------
// TOGGLE MODE (INSIDE MENU)
// -----------------------------
toggleBtn.addEventListener('click', () => {

  if (fourPlayerDiv.classList.contains('hidden')) {
    // Switch to 4-player
    twoPlayerDiv.classList.add('hidden');
    fourPlayerDiv.classList.remove('hidden');
    toggleBtn.textContent = "Switch to 2 Player Mode";
  } else {
    // Switch to 2-player
    fourPlayerDiv.classList.add('hidden');
    twoPlayerDiv.classList.remove('hidden');
    toggleBtn.textContent = "Switch to 4 Player Mode";
  }

  // Close menu after switching
  menuPanel.classList.add('hidden');
});


// -----------------------------
// START IN 4-PLAYER MODE
// -----------------------------
twoPlayerDiv.classList.add('hidden');
fourPlayerDiv.classList.remove('hidden');

// Remove title if it exists
const title = document.getElementById('title');
if (title) title.remove();


// -----------------------------
// INITIAL DISPLAY UPDATE
// -----------------------------
updateDisplay();
