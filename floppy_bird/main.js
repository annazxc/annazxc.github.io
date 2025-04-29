import { Game } from "./classes/game.js";

// Load and initialize game sounds
export const sounds = {
  flap: new Audio("assets/flap.mp3"),
  score: new Audio("assets/score.mp3"),
  hit: new Audio("assets/hit.mp3"),
  powerUp: new Audio("assets/powerUp.mp3"),
  loseLife: new Audio("assets/loseLife.mp3"),
  shieldActivate: new Audio("assets/shieldActivate.mp3"),
};

export function playSound(sound) {
  try {
    sound.currentTime = 0;
    sound.play().catch((e) => console.log("Sound play failed:", e));
  } catch (e) {
    console.log("Sound error:", e);
  }
}
export function updateLifeDisplay(lives) {
  const lifeDisplay = document.getElementById("life-display");
  if (lifeDisplay) {
    lifeDisplay.innerHTML = "";
    for (let i = 0; i < lives; i++) {
      const heart = document.createElement("span");
      heart.innerHTML = "❤️";
      heart.className = "heart";
      lifeDisplay.appendChild(heart);
    }
  }
}

window.onload = () => {
  // Initialize the game
  alert(
    "Welcome to the Game!\n\n" +
      "🕹️ Controls:\n" +
      "- Press Space or Up Arrow to fly up\n" +
      "- Use Left/Right Arrows to move\n\n" +
      "⭐ Collect stars to fill the shield meter\n" +
      "❤️ Collect hearts to gain extra lives\n" +
      "🛡️ Press 'S' to activate shield when full\n\n" +
      "You won't lose a life when hitting pipes while the shield is active.\n\n" +
      "Click OK to start!"
  );
  const game = new Game();
  console.log("Game initialized!");
};
