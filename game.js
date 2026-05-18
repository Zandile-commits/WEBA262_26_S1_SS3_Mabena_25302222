const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};

const gameState = {
  player: settings.player || "Guest",
  difficulty: settings.difficulty || "easy",
  score: 0,
  caught: 0,
  missed: 0,
  lives: 3,
  running: false,

  batColour: settings.batColour || "blue",
  doubleScore: settings.doubleScore || false,
  showShadow: settings.showShadow || false,
  randomSizes: settings.randomSizes || false,

  // Change 1: Countdown Timer Added
  timer: 60,
  timerInterval: null,
  // End Change 1

  // Change 3: High Score System Added
  highScore: localStorage.getItem("skyHighScore") || 0
  // End Change 3
};

const gameArea = document.getElementById("gameArea");
const bat = document.getElementById("bat");

const displayPlayer = document.getElementById("displayPlayer");
const displayScore = document.getElementById("displayScore");
const displayCaught = document.getElementById("displayCaught");
const displayMissed = document.getElementById("displayMissed");
const displayLives = document.getElementById("displayLives");
const displayDifficulty = document.getElementById("displayDifficulty");
const displayTimer = document.getElementById("displayTimer");
const displayHighScore = document.getElementById("displayHighScore");

const messageArea = document.getElementById("messageArea");
const logArea = document.getElementById("logArea");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const resetBtn = document.getElementById("resetBtn");
const backBtn = document.getElementById("backBtn");

bat.style.background = gameState.batColour;

function updateDisplay() {
  displayPlayer.textContent = gameState.player;
  displayScore.textContent = gameState.score;
  displayCaught.textContent = gameState.caught;
  displayMissed.textContent = gameState.missed;
  displayLives.textContent = gameState.lives;
  displayDifficulty.textContent = gameState.difficulty;
  displayTimer.textContent = gameState.timer;
  displayHighScore.textContent = gameState.highScore;
}

updateDisplay();

function log(text) {
  const entry = document.createElement("div");
  entry.textContent = text;
  logArea.prepend(entry);
}

function getSpeed() {
  switch (gameState.difficulty) {
    case "easy":
      return 1400;
    case "medium":
      return 1000;
    case "hard":
      return 700;
    default:
      return 1000;
  }
}

// Change 2: Sound Effects Added
function playCatchSound() {
  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
  audio.play();
}

function playMissSound() {
  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
  audio.play();
}

function playGameOverSound() {
  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/concussive_drum_hit.ogg");
  audio.play();
}
// End Change 2

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
saveBtn.addEventListener("click", saveGame);
loadBtn.addEventListener("click", loadGame);
resetBtn.addEventListener("click", resetGame);
backBtn.addEventListener("click", goBack);

let batX = 380;

document.addEventListener("keydown", (e) => {

  if (e.key === "ArrowLeft") {
    batX -= 25;
  }

  if (e.key === "ArrowRight") {
    batX += 25;
  }

  const max = gameArea.clientWidth - bat.offsetWidth;

  if (batX < 0) batX = 0;
  if (batX > max) batX = max;

  bat.style.left = batX + "px";
});

function startGame() {

  if (gameState.running) return;

  gameState.running = true;

  messageArea.textContent = "Game started!";
  log("Game started");

  // Change 1: Countdown Timer Added
  gameState.timerInterval = setInterval(() => {

    gameState.timer--;

    displayTimer.textContent = gameState.timer;

    if (gameState.timer <= 0) {

      clearInterval(gameState.timerInterval);

      gameOver();
    }

  }, 1000);
  // End Change 1

  spawnLoop();
}

function togglePause() {

  gameState.running = !gameState.running;

  messageArea.textContent = gameState.running ? "Resumed" : "Paused";

  log(gameState.running ? "Game resumed" : "Game paused");
}

function resetGame() {

  gameState.score = 0;
  gameState.caught = 0;
  gameState.missed = 0;
  gameState.lives = 3;

  // Change 1: Timer Reset Added
  gameState.timer = 60;
  clearInterval(gameState.timerInterval);
  // End Change 1

  updateDisplay();

  messageArea.textContent = "Game reset.";

  log("Game reset");
}

function saveGame() {

  localStorage.setItem("skyGame", JSON.stringify(gameState));

  messageArea.textContent = "Game saved!";

  log("Game saved");
}

function loadGame() {

  const data = JSON.parse(localStorage.getItem("skyGame"));

  if (!data) {
    alert("No saved game found!");
    return;
  }

  Object.assign(gameState, data);

  updateDisplay();

  messageArea.textContent = "Game loaded!";

  log("Game loaded");
}

function goBack() {
  window.location.href = "index.html";
}

function spawnLoop() {

  if (!gameState.running) return;

  createItem();

  setTimeout(spawnLoop, getSpeed());
}

function createItem() {

  const item = document.createElement("div");

  item.classList.add("falling-object");

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

function catchItem(item) {

  let value = parseInt(item.dataset.value);

  if (gameState.doubleScore) {
    value *= 2;
  }

  gameState.score += value;
  gameState.caught++;

  // Change 2: Catch Sound Added
  playCatchSound();
  // End Change 2

  // Change 3: High Score System Added
  if (gameState.score > gameState.highScore) {

    gameState.highScore = gameState.score;

    localStorage.setItem("skyHighScore", gameState.highScore);
  }
  // End Change 3

  item.remove();

  updateDisplay();
}

function missItem(item) {

  gameState.missed++;
  gameState.lives--;

  // Change 2: Miss Sound Added
  playMissSound();
  // End Change 2

  item.remove();

  updateDisplay();

  if (gameState.lives <= 0) {
    gameOver();
  }
}

function gameOver() {

  gameState.running = false;

  clearInterval(gameState.timerInterval);

  // Change 2: Game Over Sound Added
  playGameOverSound();
  // End Change 2

  messageArea.textContent = "Game Over!";

  log("Game Over");

  alert("Game Over! Your score was: " + gameState.score);
}
