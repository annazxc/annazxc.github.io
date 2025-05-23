import { CONFIG } from "../config.js";

export class UIManager {
  constructor(game) {
    this.game = game;
  }
  setupDifficultySelectors() {
    const easyBtn = document.getElementById("easy-btn");
    const mediumBtn = document.getElementById("medium-btn");
    const hardBtn = document.getElementById("hard-btn");

    easyBtn.addEventListener("click", () => {
      this.game.difficulty = "easy";
      this.game.resetGame();
    });

    mediumBtn.addEventListener("click", () => {
      this.game.difficulty = "medium";
      this.game.resetGame();
    });

    hardBtn.addEventListener("click", () => {
      this.game.difficulty = "hard";
      this.game.resetGame();
    });
  }

  updateLifeDisplay(lives) {
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

  updateScoreDisplay(score, highScore) {
    document.getElementById("score").textContent = score;
    this.updateHighScore(highScore);
  }

  updateHighScore(highScore) {
    document.getElementById("highScore").textContent = highScore;
  }

  resetUI(lives) {
    document.getElementById("score").textContent = "0";
    this.updateLifeDisplay(lives);
  }

  showDifficultySelector() {
    document.getElementById("difficulty-selector").style.display = "block";
  }

  drawGameOver(ctx, score, highScore) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    ctx.fillStyle = "white";
    ctx.font = "48px Times New Roman";
    ctx.textAlign = "center";
    ctx.fillText(
      "Game Over",
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 - 50
    );

    ctx.font = "24px Times New Roman";
    ctx.fillText(
      `Score: ${score}`,
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2
    );
    ctx.fillText(
      `Best Score: ${highScore}`,
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 + 40
    );
    ctx.fillText(
      "Click or press Enter to restart",
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 + 100
    );
  }

  showControlsHint() {
    // Remove existing controls hint if present
    const existingHint = document.querySelector(".controls-hint");
    if (existingHint) {
      existingHint.remove();
    }

    // Create and append new controls hint
    const hint = document.createElement("div");
    hint.className = "controls-hint";
    hint.innerHTML = `
      <p>🕹️ Controls:</p>
      <p>- Space/Up: Flap</p>
      <p>- Left/Right: Move</p>
      <p>- P: Use Power when full</p>
    `;
    document.getElementById("game-container").appendChild(hint);

    // Hide hint after 5 seconds
    setTimeout(() => {
      hint.style.opacity = "0";
      setTimeout(() => hint.remove(), 1000);
    }, 5000);
  }

  showPowerUpMessage(text, color) {
    const msg = document.createElement("div");
    msg.className = "power-up-message";
    msg.textContent = text;
    msg.style.color = color;
    document.getElementById("game-container").appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
  }
}
