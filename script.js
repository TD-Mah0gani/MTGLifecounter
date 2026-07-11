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

const playerMenu        = document.getElementById('player-menu');
const playerNameInput   = document.getElementById('player-name-input');
const counterCheckboxes = document.getElementById('counter-checkboxes');
const bgUploadInput     = document.getElementById('bg-upload');
const applyPlayerBtn    = document.getElementById('apply-player-settings');
const closePlayerBtn    = document.getElementById('close-player-menu');

// STATE
let players = [];
let startingLife = 40;
let gameType = 'commander';
let activePlayerId = null;

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

    // Counter list container
    const counterList = document.createElement('div');
    counterList.className = 'counter-list';

    p.counters.forEach(counter => {
      const bubble = document.createElement('div');
      bubble.className = 'counter-bubble';
      bubble.dataset.player = p.id;
      bubble.dataset.counter = counter.name;

      const minusBtn = document.createElement('button');
      minusBtn.className = 'counter-minus';
      minusBtn.textContent = '−';

      const plusBtn = document.createElement('button');
      plusBtn.className = 'counter-plus';
      plusBtn.textContent = '+';

      const label = document.createElement('span');
      label.textContent = `${counter.name}: ${counter.value}`;

      minusBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        counter.value--;
        saveState();
        buildPlayerGrid();
      });

      plusBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        counter.value++;
        saveState();
        buildPlayerGrid();
      });

      bubble.appendChild(minusBtn);
      bubble.appendChild(label);
      bubble.appendChild(plusBtn);

      counterList.appendChild(bubble);
    });

    // Click zone (not buttons) → open player menu
    zone.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      activePlayerId = p.id;
      openPlayerMenu(p);
    });

    zone.appendChild(nameEl);
    zone.appendChild(lifeEl);
    zone.appendChild(buttonsRow);
    zone.appendChild(counterList);

    playerGrid.appendChild(zone);
  });
}

// PLAYER MENU
function openPlayerMenu(player) {
  playerNameInput.value = player.name;
  bgUploadInput.value = '';

  // Set checkboxes based on existing counters
  const boxes = counterCheckboxes.querySelectorAll('input[type="checkbox"]');
  boxes.forEach(box => {
    box.checked = player.counters.some(c => c.name === box.value);
  });

  playerMenu.classList.remove('hidden');
}

closePlayerBtn.addEventListener('click', () => {
  playerMenu.classList.add('hidden');
});

applyPlayerBtn.addEventListener('click', () => {
  const player = players.find(p => p.id === activePlayerId);
  if (!player) return;

  const newName = playerNameInput.value.trim();
  const bgFile = bgUploadInput.files[0];

  if (newName) player.name = newName;

  // Update counters based on checkboxes
  const boxes = counterCheckboxes.querySelectorAll('input[type="checkbox"]');
  const selectedNames = [];
  boxes.forEach(box => {
    if (box.checked) selectedNames.push(box.value);
  });

  // Remove counters that are no longer selected
  player.counters = player.counters.filter(c => selectedNames.includes(c.name));

  // Add missing selected counters
  selectedNames.forEach(name => {
    if (!player.counters.some(c => c.name === name)) {
      player.counters.push({ name, value: 0 });
    }
  });

  // Background upload
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

// MENU BUTTON
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
