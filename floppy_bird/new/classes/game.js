import { Bird } from "./bird.js";
import { Pipe } from "./pipe.js";
import { Background } from "./backGround.js";
import { CONFIG } from "../config.js";
import { Sound } from "./sound.js";
import { UIManager } from "./uiManager.js";
import { CollisionManager } from "./collision.js";
import { PowerUpManager } from "./powerUp.js";
import { InputHandler } from "./inputHandler.js";

export class Game {
  constructor() {
    this.initialize();
    this.setupManagers();
    this.setupEventHandlers();
  }

  initialize() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.difficulty = "medium";
    this.sound = new Sound();
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem("flappyHighScore")) || 0;
    this.active = true;
    this.gameStarted = false;
    this.nextPipeFrame = 0;
    this.lastTime = 0;
  }

  setupManagers() {
    this.bird = new Bird(
      CONFIG.CANVAS_WIDTH / 4,
      CONFIG.CANVAS_HEIGHT / 2,
      30,
      this.ctx,
      this.difficulty,
      this.sound
    );
    this.background = new Background(this);
    this.pipes = [];
    this.powerUps = [];

    this.uiManager = new UIManager(this);
    this.collisionManager = new CollisionManager(this);
    this.powerUpManager = new PowerUpManager(this);
    this.inputHandler = new InputHandler(this);

    this.uiManager.updateLifeDisplay(this.bird.lives);
    this.uiManager.updateScoreDisplay(this.score, this.highScore);
  }

  setupEventHandlers() {
    this.inputHandler.setupEventListeners();
    this.uiManager.setupDifficultySelectors();
  }

  start() {
    this.lastTime = 0;
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  gameLoop(timestamp) {
    const deltaTime = timestamp - (this.lastTime || timestamp);
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.draw();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  update(deltaTime) {
    if (!this.active) return;

    this.updatePipes();
    this.powerUpManager.update();
    this.background.update();
    this.updateBird();
    this.collisionManager.checkCollisions();
    this.collisionManager.handleBoundaries();
  }

  updateBird() {
    // Process inputs
    if (this.inputHandler.keys.left) {
      this.bird.physics.moveHorizontal(-1);
    }
    if (this.inputHandler.keys.right) {
      this.bird.physics.moveHorizontal(1);
    }
    this.bird.update();

    if (this.bird.lives <= 0) {
      this.endGame();
    }
  }

  updatePipes() {
    // Generate new pipes
    this.nextPipeFrame--;
    if (this.nextPipeFrame <= 0 && this.pipes.length < CONFIG.MAX_PIPES) {
      this.generatePipe();
    }

    // Update existing pipes
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const pipe = this.pipes[i];
      pipe.update();

      if (pipe.isOffScreen()) {
        this.pipes.splice(i, 1);
        continue;
      }

      // Check for pipe passing (scoring)
      if (!pipe.passed && pipe.x + CONFIG.PIPE_WIDTH < this.bird.x) {
        pipe.passed = true;
        this.incrementScore();
      }
    }
  }

  generatePipe() {
    const pipe = new Pipe(CONFIG.CANVAS_WIDTH);
    this.pipes.push(pipe);
    this.nextPipeFrame = CONFIG.PIPE_SPACING;
  }

  draw() {
    this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    this.background.draw(this.ctx);
    this.drawGameObjects();

    if (!this.active) {
      this.uiManager.drawGameOver(this.ctx, this.score, this.highScore);
    }
  }

  drawGameObjects() {
    for (const pipe of this.pipes) {
      pipe.draw(this.ctx);
    }
    for (const powerUp of this.powerUps) {
      powerUp.draw(this.ctx);
    }
    this.bird.draw(this.ctx);
  }

  incrementScore() {
    this.score++;
    this.uiManager.updateScoreDisplay(this.score, this.highScore);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("flappyHighScore", this.highScore.toString());
      this.uiManager.updateHighScore(this.highScore);
    }

    this.sound.play("score");
  }

  loseLife() {
    if (!this.bird.invulnerable) {
      this.bird.lives--;
      this.uiManager.updateLifeDisplay(this.bird.lives);
      this.bird.physics.setInvulnerable(90); // 1.5 seconds of invulnerability
      this.sound.play("loseLife");
      return this.bird.lives;
    }
    return false;
  }

  endGame() {
    this.active = false;
    this.bird.alive = false;
    this.sound.play("hit");
    this.uiManager.showDifficultySelector();
  }

  resetGame() {
    this.pipes = [];
    this.powerUps = [];
    this.nextPipeFrame = 100;
    this.score = 0;

    this.bird = new Bird(
      CONFIG.CANVAS_WIDTH / 4,
      CONFIG.CANVAS_HEIGHT / 2,
      30,
      this.ctx,
      this.difficulty,
      this.sound
    );

    this.active = true;
    this.gameStarted = false;

    this.uiManager.resetUI(this.bird.lives);
    this.uiManager.showControlsHint();
  }
}
