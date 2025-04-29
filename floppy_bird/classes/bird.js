import { CONFIG } from "../config.js";
import { updateLifeDisplay } from "../main.js";
import { sounds } from "../main.js";
import { playSound } from "../main.js";

export class Bird {
  constructor(x, y, size, difficulty = "medium") {
    this.x = x;
    this.y = y;
    this.size = size;
    this.velocityY = 0;
    this.velocityX = 0;
    this.rotation = 0;
    this.color = "#FFD700"; // Gold color
    this.alive = true;
    this.birdImage = new Image();
    this.birdImage.src = "assets/hummingbird.png";

    // Set lives based on difficulty
    switch (difficulty) {
      case "easy":
        this.lives = 7;
        break;
      case "hard":
        this.lives = 3;
        break;
      case "medium":
      default:
        this.lives = 5;
        break;
    }

    this.invulnerable = false;
    this.invulnerableTimer = 0;
    this.shieldActive = false;
    this.shieldTimer = 0;
    this.power = 0;
    this.maxPower = 100;
    this.powerIncrement = 1;
  }
  //bird's position
  update() {
    // Apply gravity
    this.velocityY += CONFIG.GRAVITY;
    this.y += this.velocityY;
    this.x += this.velocityX;

    // Calculate bird rotation based on velocity
    this.rotation = Math.min(
      Math.PI / 4,
      Math.max(-Math.PI / 4, this.velocityY * 0.05)
    );

    // Constrain bird to canvas boundaries
    if (this.y <= 0) {
      this.y = 0;
      this.velocityY = 0;
    }

    // Handle ground collision with bounce
    if (this.y >= CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - this.size) {
      this.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - this.size;
      this.velocityY = -this.velocityY * 0.5; // Bounce effect

      // Check if sounds is initialized before using it
      if (sounds && sounds.hit) {
        sounds.hit.currentTime = 0;
        sounds.hit.play().catch((e) => console.log("Sound play failed:", e));
      }
    }

    // Handle horizontal boundaries
    if (this.x <= 0) {
      this.x = 0;
      this.velocityX = 0;
    }
    if (this.x >= CONFIG.CANVAS_WIDTH - this.size) {
      this.x = CONFIG.CANVAS_WIDTH - this.size;
      this.velocityX = 0;
    }

    // Gradually reduce horizontal velocity (friction)
    this.velocityX *= 0.95;
    // Update invulnerability timer
    if (this.invulnerable) {
      this.invulnerableTimer--;
      if (this.invulnerableTimer <= 0) {
        this.invulnerable = false;
      }
    }

    // Update shield timer
    if (this.shieldActive) {
      this.shieldTimer--;
      if (this.shieldTimer <= 0) {
        this.shieldActive = false;
      }
    }

    // Increment power over time
    if (this.power < this.maxPower) {
      this.power += this.powerIncrement * 0.05;
      if (this.power > this.maxPower) {
        this.power = this.maxPower;
      }
      // Update power meter UI
      const powerFill = document.getElementById("power-fill");
      if (powerFill) {
        powerFill.style.transform = `scaleX(${this.power / this.maxPower})`;
      }
    }
  }

  // Make the bird jump
  flap() {
    if (this.alive) {
      this.velocityY = CONFIG.JUMP_FORCE;

      // Check if sounds is initialized before using it
      if (sounds && sounds.flap) {
        sounds.flap.currentTime = 0;
        sounds.flap.play().catch((e) => console.log("Sound play failed:", e));
      }
    }
  }

  // Move the bird horizontally
  moveHorizontal(direction) {
    if (this.alive) {
      this.velocityX = direction * CONFIG.HORIZONTAL_SPEED;
    }
  }

  // Draw the bird on the canvas
  draw(ctx) {
    ctx.save();
    // Flash effect when invulnerable
    if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(this.rotation);
    // Draw shield effect if active
    if (this.shieldActive) {
      const gradient = ctx.createRadialGradient(
        0,
        0,
        this.size / 2,
        0,
        0,
        this.size * 1.2
      );
      gradient.addColorStop(0, "rgba(77, 213, 240, 0.1)");
      gradient.addColorStop(0.7, "rgba(77, 213, 240, 0.4)");
      gradient.addColorStop(1, "rgba(77, 213, 240, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, this.size * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw bird body
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(-this.size / 4, 0, this.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw bird wing
    ctx.fillStyle = "#FFA500"; // Orange
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size / 3, this.size / 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw bird eye
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(this.size / 4, -this.size / 6, this.size / 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.size / 4, -this.size / 6, this.size / 20, 0, Math.PI * 2);
    ctx.fill();

    // Draw bird beak
    ctx.fillStyle = "#FF6347"; // Tomato
    ctx.beginPath();
    ctx.moveTo(this.size / 3, 0);
    ctx.lineTo(this.size / 2, -this.size / 10);
    ctx.lineTo(this.size / 2, this.size / 10);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Check if bird collides with a pipe
  collidesWith(pipe) {
    // Simple rectangular collision detection
    const birdRight = this.x + this.size;
    const birdBottom = this.y + this.size;

    // Check collision with top pipe
    if (
      birdRight > pipe.x &&
      this.x < pipe.x + CONFIG.PIPE_WIDTH &&
      this.y < pipe.topHeight
    ) {
      return true;
    }

    // Check collision with bottom pipe
    if (
      birdRight > pipe.x &&
      this.x < pipe.x + CONFIG.PIPE_WIDTH &&
      birdBottom > pipe.topHeight + CONFIG.PIPE_GAP
    ) {
      return true;
    }

    return false;
  }
  // Activate shield power
  activateShield() {
    if (this.power >= this.maxPower) {
      this.shieldActive = true;
      this.shieldTimer = 300; // Shield lasts for 5 seconds (60 fps * 5)
      this.power = 0;

      // Update power meter UI
      const powerFill = document.getElementById("power-fill");
      if (powerFill) {
        powerFill.style.transform = `scaleX(0)`;
      }

      playSound(sounds.shieldActivate);
      return true;
    }
    return false;
  }
  // Lose a life and become temporarily invulnerable
  loseLife() {
    this.lives--;
    this.invulnerable = true;
    this.invulnerableTimer = 120; // 2 seconds of invulnerability

    // Update the life display
    updateLifeDisplay(this.lives);

    playSound(sounds.loseLife);

    return this.lives <= 0;
  }
}
