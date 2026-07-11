// -----------------------------
// STATE
// -----------------------------
const homeScreen   = document.getElementById('home-screen');
const gameScreen   = document.getElementById('game-screen');
const playerGrid   = document.getElementById('player-grid');
const menuPanel    = document.getElementById('menu-panel');
const menuBtn      = document.getElementById('menu-btn');

const playerCountSelect = document.getElementById('player-count');
const startingLifeSelect = document.getElementById('starting-life');
const gameTypeSelect     = document.getElementById('game-type');

const startGameBtn  = document.getElementById('start-game');
const resetGameBtn  = document.getElementById('reset-game');
const returnHomeBtn = document.getElementById('return-home');
const closeMenuBtn  = document.getElementById('close-menu');

let players = [];
let startingLife = 40;
let gameType = 'commander';

// -----------------------------
// UTIL
// -----------------------------
function saveState() {
  const state = {
    players,
    startingLife,
    gameType
  };
  localStorage.setItem('mtgState', JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem('mtgState');
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    players = state.players || [];
    startingLife = state.startingLife || 40;
    gameType = state.gameType || 'commander';
  } catch (e) {
    console.error('Failed to load state', e);
  }
}

function updateLifeDisplay() {
  players.forEach(p => {
    const el = document.querySelector(`.life-total[data-player="${p.id}"]`);
    if (el) el.textContent = p.life;
  });
}

function rebuildCounters() {
  players.forEach(p => {
    const zone = document.querySelector(`.player-zone[data-player="${p.id}"]`);
    if (!zone) return;
    // Remove old bubbles
    zone.querySelectorAll('.counter-bubble').forEach(b => b.remove());
    // Add current counters
    p.counters.forEach(counter => {
      const bubble = document.createElement('div');
      bubble.className = 'counter-bubble';
      bubble.textContent = `${counter.name}: ${counter.value}`;
      bubble.addEventListener('click', (e) => {
        e.stopPropagation();
        // Remove this counter
        p.counters = p.counters.filter(c => c !== counter);
        rebuildCounters();
        saveState();
      });
      zone.appendChild(bubble);
    });
  });
}

// -----------------------------
// BUILD GAME LAYOUT
// -----------------------------
function buildPlayerGrid() {
  playerGrid.innerHTML = '';

  const count = players.length;

  // Simple grid layout: 2–4 players = 2 columns, 5–6 = 3 columns
  if (count <= 4) {
    playerGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
  } else {
    playerGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
  }

  players.forEach(p => {
    const zone = document.createElement('div');
    zone.className = 'player-zone';
    zone.dataset.player = p.id;

    if (p.background) {
      zone.style.backgroundImage = `url("${p.background}")`;
    }

    const nameEl = document.createElement('div');
    nameEl.className = 'player-name';
    nameEl.textContent = p.name;
    nameEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const newName = prompt('Enter player name:', p.name);
      if (newName && newName.trim() !== '') {
        p.name = newName.trim();
        nameEl.textContent = p.name;
        saveState();
      }
    });

    const lifeEl = document.createElement('div');
    lifeEl.className = 'life-total';
    lifeEl.dataset.player = p.id;
    lifeEl.textContent = p.life;

    const buttonsRow = document.createElement('div');
    buttonsRow.className = 'buttons';

    const btnPlus5 = document.createElement('button');
    btnPlus5.textContent = '+5';
    btnPlus5.dataset.player = p.id;
    btnPlus5.dataset.change = 5;

    const btnPlus1 = document.createElement('button');
    btnPlus1.textContent = '+1';
    btnPlus1.dataset.player = p.id;
    btnPlus1.dataset.change = 1;

    const btnReset = document.createElement('button');
    btnReset.textContent = '⟲';
    btnReset.className = 'reset-btn';
    btnReset.dataset.player = p.id;
    btnReset.dataset.reset = 'true';

    const btnMinus1 = document.createElement('button');
    btnMinus1.textContent = '−1';
    btnMinus1.dataset.player = p.id;
    btnMinus1.dataset.change = -1;

    const btnMinus5 = document.createElement('button');
    btnMinus5.textContent = '−5';
    btnMinus5.dataset.player = p.id;
    btnMinus5.dataset.change = -5;

    buttonsRow.appendChild(btnPlus5);
    buttonsRow.appendChild(btnPlus1);
    buttonsRow.appendChild(btnReset);
    buttonsRow.appendChild(btnMinus1);
    buttonsRow.appendChild(btnMinus5);

    // Customize button (name + background)
    const customizeBtn = document.createElement('button');
    customizeBtn.textContent = 'Customize';
    customizeBtn.style.marginTop = '15px';
    customizeBtn.dataset.player = p.id;
    customizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newName = prompt('Enter player name:', p.name);
      if (newName && newName.trim() !== '') {
        p.name = newName.trim();
        nameEl.textContent = p.name;
      }
      const bgUrl = prompt('Enter background image URL (optional):', p.background || '');
      if (bgUrl && bgUrl.trim() !== '') {
        p.background = bgUrl.trim();
        zone.style.backgroundImage = `url("${p.background}")`;
      }
      // Simple manual text mode toggle
      const textMode = prompt('Is this background dark or light? (type "dark" or "light")', 'dark');
      zone.classList.remove('dark-text', 'light-text');
      if (textMode === 'light') {
        zone.classList.add('light-text');
      } else {
        zone.classList.add('dark-text');
      }
      saveState();
    });

    // Click on zone to add counters
    zone.addEventListener('click', (e) => {
      // Ignore button clicks
      if (e.target.tagName === 'BUTTON') return;
      const counterName = prompt('Enter counter name (e.g. Poison, Commander Damage):');
      if (!counterName || counterName.trim() === '') return;
      const valueStr = prompt(`Enter value for ${counterName}:`, '1');
      const value = Number(valueStr) || 1;
      p.counters.push({ name: counterName.trim(), value });
      rebuildCounters();
      saveState();
    });

    zone.appendChild(nameEl);
    zone.appendChild(lifeEl);
    zone.appendChild(buttonsRow);
    zone.appendChild(customizeBtn);

    playerGrid.appendChild(zone);
  });

  updateLifeDisplay();
  rebuildCounters();
}

// -----------------------------
// START GAME
// -----------------------------
startGameBtn.addEventListener('click', () => {
  const count = Number(playerCountSelect.value);
  startingLife = Number(startingLifeSelect.value);
  gameType = gameTypeSelect.value;

  players = [];
  for (let i = 0; i < count; i++) {
    players.push({
      id: i,
      name: `Player ${i + 1}`,
      life: startingLife,
      background: '',
      counters: []
    });
  }

  saveState();
  buildPlayerGrid();

  homeScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
});

// -----------------------------
// MENU
// -----------------------------
menuBtn.addEventListener('click', () => {
  menuPanel.classList.remove('hidden');
});

closeMenuBtn.addEventListener('click', () => {
  menuPanel.classList.add('hidden');
});

resetGameBtn.addEventListener('click', () => {
  players.forEach(p => {
    p.life = startingLife;
    p.counters = [];
  });
  updateLifeDisplay();
  rebuildCounters();
  saveState();
  menuPanel.classList.add('hidden');
});

returnHomeBtn.addEventListener('click', () => {
  menuPanel.classList.add('hidden');
  gameScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
});

// -----------------------------
// BUTTON CLICK HANDLER (LIFE)
// -----------------------------
document.addEventListener('click', (event) => {
  const btn = event.target;
  if (btn.tagName !== 'BUTTON') return;

  const playerId = btn.dataset.player;
  if (playerId === undefined) return;

  const player = players.find(p => String(p.id) === String(playerId));
  if (!player) return;

  if (btn.dataset.reset) {
    player.life = startingLife;
  } else if (btn.dataset.change) {
    const change = Number(btn.dataset.change);
    player.life += change;
  }

  updateLifeDisplay();
  saveState();
});

// -----------------------------
// INITIAL LOAD
// -----------------------------
loadState();

if (players.length > 0) {
  // Resume game
  buildPlayerGrid();
  homeScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
} else {
  // Fresh start
  homeScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');
}
