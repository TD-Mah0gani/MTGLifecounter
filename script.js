// ELEMENTS
const homeScreen   = document.getElementById('home-screen');
const gameScreen   = document.getElementById('game-screen');
const playerGrid   = document.getElementById('player-grid');
const menuPanel    = document.getElementById('menu-panel');
const menuBtn      = document.getElementById('menu-btn');

const playerCountSelect   = document.getElementById('player-count');
const startingLifeSelect  = document.getElementById('starting-life');
const gameTypeSelect      = document.getElementById('game-type');

const startGameBtn  = document.getElementById('start-game');
const resetGameBtn  = document.getElementById('reset-game');
const returnHomeBtn = document.getElementById('return-home');
const closeMenuBtn  = document.getElementById('close-menu');

// PLAYER POPUP MENU
let activePlayerId = null;

const playerMenu = document.createElement('div');
playerMenu.id = 'player-menu';
playerMenu.classList.add('hidden');
playerMenu.innerHTML = `
  <div class="player-menu-content">
    <h2>Edit Player</h2>

    <label>Name</label>
    <input type="text" id="player-name-input">

    <label>Counter Type</label>
    <select id="counter-type">
      <option value="Poison">Poison</option>
      <option value="Commander Damage">Commander Damage</option>
      <option value="Energy">Energy</option>
      <option value="Experience">Experience</option>
      <option value="Custom">Custom</option>
    </select>

    <label>Background Image</label>
    <input type="file" id="bg-upload" accept="image/*">

    <button id="apply-player-settings">Apply</button>
    <button id="close-player-menu">Close</button>
  </div>
`;
document.body.appendChild(playerMenu);

const playerNameInput   = document.getElementById('player-name-input');
const counterTypeSelect = document.getElementById('counter-type');
const bgUploadInput     = document.getElementById('bg-upload');
const applyPlayerBtn    = document.getElementById('apply-player-settings');
const closePlayerBtn    = document.getElementById('close-player-menu');

// STATE
let players = [];
let startingLife = 40;
let gameType = 'commander';

// SAVE / LOAD
function saveState() {
  localStorage.setItem('mtgState', JSON.stringify({ players, startingLife, gameType }));
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

// BUILD PLAYER GRID
function buildPlayerGrid() {
  playerGrid.innerHTML = '';

  const count = players.length;
  playerGrid.style.gridTemplateColumns = count <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

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

    const lifeEl = document.createElement('div');
    lifeEl.className = 'life-total';
    lifeEl.dataset.player = p.id;
    lifeEl.textContent = p.life;

    const buttonsRow = document.createElement('div');
    buttonsRow.className = 'buttons';

    const btns = [
      { text: '+5', change: 5 },
      { text: '+1', change: 1 },
      { text: '⟲', reset: true },
      { text: '−1', change: -1 },
      { text: '−5', change: -5 }
    ];

    btns.forEach(b => {
      const btn = document.createElement('button');
      btn.textContent = b.text;
      btn.dataset.player = p.id;
      if (b.reset) btn.dataset.reset = 'true';
      if (b.change) btn.dataset.change = b.change;
      buttonsRow.appendChild(btn);
    });

    // Floating counters
    p.counters.forEach(counter => {
      const bubble = document.createElement('div');
      bubble.className = 'counter-bubble';
      bubble.dataset.player = p.id;
      bubble.dataset.counter = counter.name;
      bubble.textContent = `${counter.name}: ${counter.value}`;
      zone.appendChild(bubble);
    });

    // Click zone (not buttons, not bubbles) → open player menu
    zone.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      if (e.target.classList.contains('counter-bubble')) return;

      activePlayerId = p.id;
      openPlayerMenu(p);
    });

    // Click counter bubble → counter menu
    zone.addEventListener('click', (e) => {
      if (!e.target.classList.contains('counter-bubble')) return;

      const counterName = e.target.dataset.counter;
      const player = players.find(pl => pl.id === p.id);
      const counter = player.counters.find(c => c.name === counterName);

      const action = prompt(
        `${counterName}: ${counter.value}\n\nChoose:\n1 = +1\n2 = -1\n3 = Remove Counter`,
        '1'
      );

      if (action === '1') counter.value++;
      if (action === '2') counter.value--;
      if (action === '3') {
        player.counters = player.counters.filter(c => c !== counter);
      }

      saveState();
      buildPlayerGrid();
    });

    zone.appendChild(nameEl);
    zone.appendChild(lifeEl);
    zone.appendChild(buttonsRow);

    playerGrid.appendChild(zone);
  });
}

// PLAYER MENU
function openPlayerMenu(player) {
  playerNameInput.value = player.name;
  counterTypeSelect.value = 'Poison';
  bgUploadInput.value = '';
  playerMenu.classList.remove('hidden');
}

closePlayerBtn.addEventListener('click', () => {
  playerMenu.classList.add('hidden');
});

applyPlayerBtn.addEventListener('click', () => {
  const player = players.find(p => p.id === activePlayerId);
  if (!player) return;

  const newName = playerNameInput.value.trim();
  const counterType = counterTypeSelect.value;
  const bgFile = bgUploadInput.files[0];

  if (newName) player.name = newName;

  if (counterType === 'Custom') {
    const customName = prompt('Enter custom counter name:');
    if (customName) player.counters.push({ name: customName.trim(), value: 1 });
  } else {
    player.counters.push({ name: counterType, value: 1 });
  }

  if (bgFile) {
    const reader = new FileReader();
    reader.onload = () => {
      player.background = reader.result;
      saveState();
      buildPlayerGrid();
    };
    reader.readAsDataURL(bgFile);
  } else {
    saveState();
    buildPlayerGrid();
  }

  playerMenu.classList.add('hidden');
});

// LIFE BUTTONS
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
    player.life += Number(btn.dataset.change);
  }

  saveState();
  buildPlayerGrid();
});

// MENU BUTTON (CENTERED)
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
  saveState();
  buildPlayerGrid();
  menuPanel.classList.add('hidden');
});

returnHomeBtn.addEventListener('click', () => {
  menuPanel.classList.add('hidden');
  gameScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
});

// START GAME
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

// INITIAL LOAD
loadState();

if (players.length > 0) {
  buildPlayerGrid();
  homeScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
} else {
  homeScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');
}
