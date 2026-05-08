const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};

const gameState = {
  player: settings.player || "Guest",
  difficulty: settings.difficulty || "easy",
  score: 0,
  caught: 0,
  missed: 0,
  lives: 3,
  running: false,

  // NEW SETTINGS
  batColour: settings.batColour || "blue",
  doubleScore: settings.doubleScore || false,
  showShadow: settings.showShadow || false,
  randomSizes: settings.randomSizes || false
};

// Elements
const gameArea = document.getElementById("gameArea");
const bat = document.getElementById("bat");

bat.style.background = gameState.batColour;

if (gameState.showShadow) {
  bat.style.boxShadow = "0 5px 10px rgba(0,0,0,0.5)";
}

const displayPlayer = document.getElementById("displayPlayer");
const displayScore = document.getElementById("displayScore");
const displayCaught = document.getElementById("displayCaught");
const displayMissed = document.getElementById("displayMissed");
const displayLives = document.getElementById("displayLives");
const displayDifficulty = document.getElementById("displayDifficulty");

const messageArea = document.getElementById("messageArea");
const logArea = document.getElementById("logArea");

// Buttons
document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("pauseBtn").addEventListener("click", togglePause);
document.getElementById("resetBtn").addEventListener("click", resetGame);
document.getElementById("saveBtn").addEventListener("click", saveGame);
document.getElementById("loadBtn").addEventListener("click", loadGame);
document.getElementById("backBtn").addEventListener("click", goBack);

// Display initial values
displayPlayer.textContent = gameState.player;
displayDifficulty.textContent = gameState.difficulty;

// Move bat
document.addEventListener("mousemove", (e) => {
  const rect = gameArea.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let max = gameArea.clientWidth - bat.offsetWidth;
if (x < 0) x = 0;
if (x > max) x = max;
  bat.style.left = x + "px";
});

// Start Game
function startGame() {
  if (gameState.running) return; 

  gameState.running = true;

  messageArea.textContent = "Game started!";
  log("Game started");

  spawnLoop();
}

// Pause
function togglePause() {
  gameState.running = !gameState.running;
  messageArea.textContent = gameState.running ? "Resumed" : "Paused";
  log(gameState.running ? "Game resumed" : "Game paused");
}

// Reset
function resetGame() {
  if (!confirm("Reset game?")) return;

  gameState.score = 0;
  gameState.caught = 0;
  gameState.missed = 0;
  gameState.lives = 3;

  updateDisplay();
  messageArea.textContent = "Game reset.";
  log("Game reset");
}

// Save (LOCAL STORAGE)
function saveGame() {
  localStorage.setItem("skyGame", JSON.stringify(gameState));
  messageArea.textContent = "Game saved!";
  log("Game saved");
}

// Load (LOCAL STORAGE)
gameState.running = false;
function loadGame() {
  const data = JSON.parse(localStorage.getItem("skyGame"));

  if (!data) {
    alert("No saved game found!");
    return;
  }

  // Restore game state
  Object.assign(gameState, data);

  // Clear old objects
  document.querySelectorAll(".falling-object").forEach(el => el.remove());

  updateDisplay();

  messageArea.textContent = "Game loaded!";
  log("Game loaded");

  // Restart game loop if it was running
  if (gameState.running) {
    spawnLoop();
  }
}

// Back button
function goBack() {
  window.location.href = "index.html";
}

// Spawn loop
function spawnLoop() {
  if (!gameState.running) return;

  console.log("SPAWNING..."); 

  createItem();
  setTimeout(spawnLoop,  getSpeed());
}

// falling objects
function createItem() {
  const item = document.createElement("div");
  item.classList.add("falling-object");

  // Random sizes feature
  if (gameState.randomSizes) {
    let size = Math.random() * 30 + 20;
    item.style.width = size + "px";
    item.style.height = size + "px";
  } else {
    item.style.width = "30px";
    item.style.height = "30px";
  }

  // Bonus items
  if (Math.random() < 0.2) {
    item.classList.add("bonus");
    item.dataset.value = 5;
  } else {
    item.dataset.value = 1;
  }

  item.style.left = Math.random() * (gameArea.clientWidth - 30) + "px";
  item.style.top = "0px";

  gameArea.appendChild(item);
  fall(item);
}
// Falling logic
function fall(item) {
  let pos = 0;

  const interval = setInterval(() => {
    if (!gameState.running) return;

    pos += 5;
    item.style.top = pos + "px";

    const itemRect = item.getBoundingClientRect();
    const batRect = bat.getBoundingClientRect();

    if (
      itemRect.bottom >= batRect.top &&
      itemRect.left < batRect.right &&
      itemRect.right > batRect.left
    ) {
      catchItem(item);
      clearInterval(interval);
    }

    if (pos > gameArea.clientHeight) {
      missItem(item);
      clearInterval(interval);
    }
  }, 50);
}

// Catch
function catchItem(item) {
  let value = parseInt(item.dataset.value);

if (gameState.doubleScore) {
  value *= 2;
}
gameState.score += value;
  gameState.caught++;

  item.remove();
  updateDisplay();
}

// Miss
function missItem(item) {
  gameState.missed++;
  gameState.lives--;

  item.remove();
  updateDisplay();

  if (gameState.lives <= 0) {
    gameOver();
  }
}

// Game Over
function gameOver() {
  gameState.running = false;
  alert("Game Over! Score: " + gameState.score);

  document.cookie = `bestScore=${gameState.score}`;
  log("Game over");
}

// Update UI
function updateDisplay() {
  displayScore.textContent = gameState.score;
  displayCaught.textContent = gameState.caught;
  displayMissed.textContent = gameState.missed;
  displayLives.textContent = gameState.lives;
}

// Log system (ARRAY usage)
let logs = [];

function log(message) {
  logs.push(message);
  logArea.innerHTML += `<p>${message}</p>`;
}

// Difficulty speed
function getSpeed() {
  if (gameState.difficulty === "hard") return 500;
  if (gameState.difficulty === "medium") return 800;
  return 1200;
}