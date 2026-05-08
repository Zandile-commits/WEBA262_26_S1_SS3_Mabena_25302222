document.addEventListener("DOMContentLoaded", function () {
// Get elements
const playerName = document.getElementById("playerName");
const difficulty = document.getElementById("difficulty");
const previewText = document.getElementById("previewText");

// Buttons
const openGameBtn = document.getElementById("openGameBtn");
const saveBtn = document.getElementById("saveSettingsBtn");
const loadBtn = document.getElementById("loadSettingsBtn");
const resetBtn = document.getElementById("resetSettingsBtn");

// Live Preview Function
function updatePreview() {
  const name = playerName.value || "Guest";
  const diff = difficulty.value;

  const colour = document.querySelector(
    "input[name='batColour']:checked"
  ).value;

  const doubleScore = document.getElementById("doubleScore").checked
    ? "ON"
    : "OFF";

  const shadow = document.getElementById("showShadow").checked
    ? "ON"
    : "OFF";

  const sizes = document.getElementById("randomSizes").checked
    ? "ON"
    : "OFF";

  previewText.textContent =
    `Player: ${name} | Difficulty: ${diff} | Colour: ${colour} | ` +
    `Double Score: ${doubleScore} | Shadow: ${shadow} | Random Sizes: ${sizes}`;
}

// Event listeners for live preview
document.querySelectorAll("input, select").forEach((el) => {
  el.addEventListener("change", updatePreview);
  el.addEventListener("input", updatePreview);
});

// OPEN GAME
openGameBtn.addEventListener("click", () => {
  const settings = getSettings();

  // Save to sessionStorage
  sessionStorage.setItem("gameSettings", JSON.stringify(settings));

  // Open game page
  window.location.href = "game.html";
});

// SAVE SETTINGS (localStorage)
saveBtn.addEventListener("click", () => {
  const settings = getSettings();
  localStorage.setItem("skySettings", JSON.stringify(settings));
  alert("Settings saved!");
});

// LOAD SETTINGS
loadBtn.addEventListener("click", () => {
  const data = JSON.parse(localStorage.getItem("skySettings"));

  if (!data) {
    alert("No saved settings found!");
    return;
  }

  applySettings(data);
  updatePreview();
});

// RESET SETTINGS
resetBtn.addEventListener("click", () => {
  document.getElementById("setupForm").reset();
  previewText.textContent = "Settings reset.";
});

// FUNCTION: Get all settings
function getSettings() {
  return {
    player: playerName.value || "Guest",
    difficulty: difficulty.value,
    batColour: document.querySelector(
      "input[name='batColour']:checked"
    ).value,
    doubleScore: document.getElementById("doubleScore").checked,
    showShadow: document.getElementById("showShadow").checked,
    randomSizes: document.getElementById("randomSizes").checked,
  };
}

// FUNCTION: Apply loaded settings
function applySettings(data) {
  playerName.value = data.player;
  difficulty.value = data.difficulty;

  document.querySelector(
    `input[name='batColour'][value='${data.batColour}']`
  ).checked = true;

  document.getElementById("doubleScore").checked = data.doubleScore;
  document.getElementById("showShadow").checked = data.showShadow;
  document.getElementById("randomSizes").checked = data.randomSizes;
}
});