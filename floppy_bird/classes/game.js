import { Bird } from "./bird.js";
import { Pipe } from "./pipe.js";
import { PowerUp } from "./powerUp.js";
import { ParticleSystem } from "./particleSystem.js";
import { Background } from "./background.js";
import { CONFIG } from "../config.js";
import { updateLifeDisplay, sounds } from "../main.js";

// Function to play sound with error handling
function playSound(sound) {
  try {
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((e) => console.log("Sound play failed:", e));
    }
  } catch (e) {
    console.log("Sound error:", e);
  }
}

export class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.difficulty = "medium"; // Default
    this.bird = new Bird(
      CONFIG.CANVAS_WIDTH / 4,
      CONFIG.CANVAS_HEIGHT / 2,
      30,
      this.difficulty
    );
    this.pipes = [];
    this.powerUps = [];
    // Initialize life display
    updateLifeDisplay(this.bird.lives);
    this.background = new Background();
    this.particles = new ParticleSystem();
    this.nextPipeFrame = 0;
    this.score = 0;
    this.highScore = localStorage.getItem("flappyHighScore") || 0;
    this.active = true;
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    // Setup event listeners
    this.setupEventListeners();
    this.setupDifficultySelectors();

    // Update UI
    document.getElementById("score").textContent = this.score;
    document.getElementById("highScore").textContent = this.highScore;

    // Start the game loop
    this.lastTime = 0;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  // Setup keyboard and touch controls
  setupEventListeners() {
    // Keyboard controls
    window.addEventListener("keydown", (e) => {
      this.handleKeyDown(e);
    });

    window.addEventListener("keyup", (e) => {
      this.handleKeyUp(e);
    });

    // Touch controls
    this.canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const x = touch.clientX - this.canvas.getBoundingClientRect().left;

      if (x < this.canvas.width / 2) {
        this.keys.left = true;
      } else {
        this.keys.right = true;
      }

      this.bird.flap();
    });

    this.canvas.addEventListener("touchend", (e) => {
      e.preventDefault();
      this.keys.left = false;
      this.keys.right = false;
    });

    // Click control
    this.canvas.addEventListener("click", () => {
      if (!this.active) {
        this.resetGame();
      } else {
        this.bird.flap();
      }
    });
  }
  setupDifficultySelectors() {
    const easyBtn = document.getElementById("easy-btn");
    const mediumBtn = document.getElementById("medium-btn");
    const hardBtn = document.getElementById("hard-btn");

    easyBtn.addEventListener("click", () => {
      this.difficulty = "easy";
      this.resetGame();
    });

    mediumBtn.addEventListener("click", () => {
      this.difficulty = "medium";
      this.resetGame();
    });

    hardBtn.addEventListener("click", () => {
      this.difficulty = "hard";
      this.resetGame();
    });
  }

  handleKeyDown(e) {
    // Start the game on first key press
    if (!this.gameStarted && this.active) {
      this.gameStarted = true;
      // Hide tutorial after some time
      setTimeout(() => {
        const tutorial = document.getElementById("tutorial");
        if (tutorial) {
          tutorial.style.opacity = "0";
        }
      }, 5000);
    }

    switch (e.key) {
      case " ":
      case "ArrowUp":
        e.preventDefault();
        this.keys.up = true;
        this.bird.flap();
        break;
      case "ArrowDown":
        this.keys.down = true;
        break;
      case "ArrowLeft":
        e.preventDefault();
        this.keys.left = true;
        break;
      case "ArrowRight":
        e.preventDefault();
        this.keys.right = true;
        break;
      case "s":
      case "S":
        // Activate shield power
        if (this.bird.activateShield()) {
          this.particles.addParticles(
            this.bird.x + this.bird.size / 2,
            this.bird.y + this.bird.size / 2,
            20,
            "#4FC3F7"
          );
        }
        break;
      case "Enter":
        if (!this.active) {
          this.resetGame();
        }
        break;
    }
  }

  // Handle key release
  handleKeyUp(e) {
    switch (e.key) {
      case " ":
      case "ArrowUp":
        this.keys.up = false;
        break;
      case "ArrowDown":
        this.keys.down = false;
        break;
      case "ArrowLeft":
        this.keys.left = false;
        break;
      case "ArrowRight":
        this.keys.right = false;
        break;
    }
  }

  // Main game loop
  gameLoop(timestamp) {
    // Calculate delta time for smooth animations
    const deltaTime = timestamp - (this.lastTime || timestamp);
    this.lastTime = timestamp;

    // Update game state
    this.update(deltaTime);

    // Draw the game
    this.draw();

    // Continue the game loop
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  // Update game state
  update(deltaTime) {
    if (!this.active) return;

    // Generate pipes
    this.nextPipeFrame--;
    if (this.nextPipeFrame <= 0 && this.pipes.length < CONFIG.MAX_PIPES) {
      this.pipes.push(new Pipe(CONFIG.CANVAS_WIDTH));
      this.nextPipeFrame = CONFIG.PIPE_SPACING;
    }
    // Generate power-ups
    this.generatePowerUp();

    // Update background
    this.background.update();

    // Update bird
    this.bird.update();

    // Handle horizontal movement
    if (this.keys.left) {
      this.bird.moveHorizontal(-1);
    }
    if (this.keys.right) {
      this.bird.moveHorizontal(1);
    }

    // Update pipes and check collisions
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.update();

      // Remove off-screen pipes
      if (pipe.isOffScreen()) {
        this.pipes.splice(i, 1);
        continue;
      }

      // Check for pipe passing (scoring)
      if (!pipe.passed && pipe.x + CONFIG.PIPE_WIDTH < this.bird.x) {
        pipe.passed = true;
        this.incrementScore();
      }

      if (
        this.bird.collidesWith(pipe) &&
        !this.bird.invulnerable &&
        !this.bird.shieldActive
      ) {
        // Create hit particles
        this.particles.addParticles(
          this.bird.x + this.bird.size / 2,
          this.bird.y + this.bird.size / 2,
          10,
          "#FF0000"
        );

        // Instead of ending game immediately, lose a life
        const gameOver = this.bird.loseLife();

        // Apply knockback effect
        this.bird.velocityX = -5;
        this.bird.velocityY = -5;

        // Only end game if all lives are lost
        if (gameOver) {
          this.endGame();
        }
      }
    }
    // Update power-ups
    this.updatePowerUps();

    // Update particles
    this.particles.update();

    // Create trail effect
    if (Math.random() < 0.3) {
      this.particles.addParticles(
        this.bird.x + this.bird.size / 2,
        this.bird.y + this.bird.size / 2,
        1,
        `hsl(${Math.random() * 60 + 30}, 100%, 70%)`
      );
    }
    // Check if bird hit the ground and should die
    if (
      this.bird.y >=
        CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - this.bird.size &&
      this.bird.lives <= 1
    ) {
      this.endGame();
    }
  }
  // Method to generate power-ups
  generatePowerUp() {
    // Only generate power-ups after player has scored some points
    if (this.score < 3) return;

    this.nextPowerUpFrame--;
    if (this.nextPowerUpFrame <= 0) {
      // Position power-up between pipes
      const x = CONFIG.CANVAS_WIDTH;
      const y =
        100 +
        Math.random() * (CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - 200);

      this.powerUps.push(new PowerUp(x, y));
      // Random interval between power-ups
      this.nextPowerUpFrame = 600 + Math.floor(Math.random() * 600); // 10-20 seconds at 60fps
    }
  }

  // Method to update power-ups
  updatePowerUps() {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update();

      // Remove off-screen power-ups
      if (powerUp.isOffScreen()) {
        this.powerUps.splice(i, 1);
        continue;
      }

      // Check for collision with bird
      if (
        !powerUp.collected &&
        this.bird.alive &&
        powerUp.collidesWith(this.bird)
      ) {
        powerUp.collected = true;
        this.powerUps.splice(i, 1);

        // Apply power-up effect
        if (powerUp.type === "life") {
          if (this.bird.lives < 5) {
            this.bird.lives++;
            updateLifeDisplay(this.bird.lives);
          }
        } else if (powerUp.type === "power") {
          this.bird.power = this.bird.maxPower;
          // Update power meter UI
          const powerFill = document.getElementById("power-fill");
          if (powerFill) {
            powerFill.style.transform = `scaleX(1)`;
          }
        }

        // Play power-up sound
        playSound(sounds.powerUp);

        // Create particles
        this.particles.addParticles(
          powerUp.x + powerUp.size / 2,
          powerUp.y + powerUp.size / 2,
          15,
          powerUp.type === "life" ? "#FF5555" : "#FFCC00"
        );
      }
    }
  }

  // Method to draw power-ups
  drawPowerUps() {
    for (const powerUp of this.powerUps) {
      powerUp.draw(this.ctx);
    }
  }
  // Add difficulty-based modifications to pipe generation
  generatePipes() {
    this.nextPipeFrame--;
    if (this.nextPipeFrame <= 0 && this.pipes.length < CONFIG.MAX_PIPES) {
      const pipe = new Pipe(CONFIG.CANVAS_WIDTH);

      // Modify pipe difficulty based on level
      switch (this.difficulty) {
        case "easy":
          pipe.topHeight = Math.max(100, pipe.topHeight); // Increase minimum gap height
          break;
        case "hard":
          // Make pipes move faster for hard difficulty
          pipe.speed = CONFIG.PIPE_SPEED * 1.5;
          break;
      }

      this.pipes.push(pipe);

      // Adjust pipe spacing based on difficulty
      switch (this.difficulty) {
        case "easy":
          this.nextPipeFrame = CONFIG.PIPE_SPACING * 1.2; // More space between pipes
          break;
        case "hard":
          this.nextPipeFrame = CONFIG.PIPE_SPACING * 0.8; // Less space between pipes
          break;
        default:
          this.nextPipeFrame = CONFIG.PIPE_SPACING;
          break;
      }
    }
  }
  // Draw the game
  draw() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Draw background
    this.background.draw(this.ctx);

    // Draw pipes
    for (const pipe of this.pipes) {
      pipe.draw(this.ctx);
    }
    // Draw power-ups
    this.drawPowerUps();

    // Draw particles
    this.particles.draw(this.ctx);

    // Draw bird
    this.bird.draw(this.ctx);

    // Draw game over screen
    if (!this.active) {
      this.drawGameOver();
    }
  }

  // Draw game over screen
  drawGameOver() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    this.ctx.fillStyle = "white";
    this.ctx.font = "48px Times New Roman";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "Game Over",
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 - 50
    );

    this.ctx.font = "24px Times New Roman";
    this.ctx.fillText(
      `Score: ${this.score}`,
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2
    );
    this.ctx.fillText(
      `Best Score: ${this.highScore}`,
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 + 40
    );
    this.ctx.fillText(
      "Click or press Enter to restart",
      CONFIG.CANVAS_WIDTH / 2,
      CONFIG.CANVAS_HEIGHT / 2 + 100
    );
  }

  // Increment score when passing a pipe
  incrementScore() {
    this.score++;
    document.getElementById("score").textContent = this.score;

    // Update high score if needed
    if (this.score > this.highScore) {
      this.highScore = this.score;
      document.getElementById("highScore").textContent = this.highScore;
      localStorage.setItem("flappyHighScore", this.highScore);
    }

    // Create score particles
    this.particles.addParticles(this.bird.x + 40, this.bird.y, 10, "#FFFF00");

    // Play score sound
    playSound(sounds.score);
  }

  endGame() {
    this.active = false;
    this.bird.alive = false;

    // Play hit sound
    playSound(sounds.hit);

    // Create explosion particles
    this.particles.addParticles(
      this.bird.x + this.bird.size / 2,
      this.bird.y + this.bird.size / 2,
      30,
      "#FF0000"
    );

    // Show difficulty selector again
    document.getElementById("difficulty-selector").style.display = "block";
  }

  // Reset the game
  resetGame() {
    this.active = true;
    this.bird = new Bird(
      CONFIG.CANVAS_WIDTH / 4,
      CONFIG.CANVAS_HEIGHT / 2,
      30,
      this.difficulty
    );
    this.pipes = [];
    this.powerUps = [];
    this.nextPipeFrame = 60;
    this.nextPowerUpFrame = 500;
    this.score = 0;
    document.getElementById("score").textContent = this.score;
    this.particles = new ParticleSystem();
    updateLifeDisplay(this.bird.lives);

    // Hide difficulty selector during gameplay
    document.getElementById("difficulty-selector").style.display = "none";
  }
}
