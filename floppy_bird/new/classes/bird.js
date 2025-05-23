import { Render } from "./render.js";
import { Physics } from "./physics.js";

export class Bird {
  constructor(x, y, size, ctx, difficulty, sound) {
    // Position and movement
    this.x = x;
    this.y = y;
    this.size = size;
    this.velocityX = 0;
    this.velocityY = 0;

    // State
    this.alive = true;
    this.invulnerable = false;
    this.invulnerabilityTimer = 0;
    this.hasHitGround = false;
    this.rotation = 0;

    // Power system
    this.power = 0;
    this.maxPower = 100;
    this.usingPower = false;
    this.powerParticles = [];

    this.ctx = ctx;
    this.sound = sound;

    // Create physics system for this bird
    this.physics = new Physics(this);

    this.birdImage = new Image();
    this.birdImage.src = "assets/hummingbird.png";

    // Set lives based on difficulty
    this.initLives(difficulty);

    // Visual effects
    this.bounceText = { show: false, timer: 0 };
    this.trail = [];
    this.render = new Render(this, this.ctx);
  }

  initLives(difficulty) {
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
  }

  usePower() {
    if (this.power === this.maxPower) {
      this.usingPower = true;
      this.createPowerParticles();
      this.power = 0;

      // Update power meter in UI
      const powerFill = document.getElementById("power-fill");
      if (powerFill) {
        powerFill.style.transform = "scaleX(0)";
      }

      return true;
    }
    return false;
  }

  createPowerParticles() {
    // Create 50 colorful particles
    this.powerParticles = [];
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 5;
      const size = 3 + Math.random() * 7;
      const life = 30 + Math.random() * 60; // Frames of life

      this.powerParticles.push({
        x: this.x + this.size / 2,
        y: this.y + this.size / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        color: this.getRandomColor(),
        life: life,
        maxLife: life,
      });
    }
  }

  getRandomColor() {
    const colors = [
      "#FF5555",
      "#FFCC00",
      "#55FF55",
      "#5555FF",
      "#FF55FF",
      "#55FFFF",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    if (!this.alive) return;
    this.physics.apply();
    this.updateState();
    this.updateTrail();
    this.updatePowerParticles();
  }

  updateState() {
    // Handle invulnerability
    if (this.invulnerable) {
      this.invulnerabilityTimer--;
      if (this.invulnerabilityTimer <= 0) {
        this.invulnerable = false;
      }
    }

    // Handle bounce text
    if (this.bounceText.show) {
      this.bounceText.timer--;
      if (this.bounceText.timer <= 0) {
        this.bounceText.show = false;
      }
    }
  }

  updateTrail() {
    // Add current position to trail
    this.trail.push({ x: this.x + this.size / 2, y: this.y + this.size / 2 });

    // Limit trail length
    if (this.trail.length > 10) {
      this.trail.shift();
    }
  }

  updatePowerParticles() {
    if (this.powerParticles.length === 0) return;

    for (let i = this.powerParticles.length - 1; i >= 0; i--) {
      const particle = this.powerParticles[i];

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Update life
      particle.life--;

      // Remove dead particles
      if (particle.life <= 0) {
        this.powerParticles.splice(i, 1);
      }
    }

    // Reset power usage when all particles are gone
    if (this.powerParticles.length === 0) {
      this.usingPower = false;
    }
  }

  showBounceText() {
    this.bounceText.show = true;
    this.bounceText.timer = 60; // Show for 1 second at 60fps
  }

  // Rendering
  draw(ctx) {
    this.drawTrail(ctx);
    if (this.powerParticles.length > 0) {
      this.drawPowerParticles(ctx);
    }
    this.drawBird(ctx);
  }

  drawTrail(ctx) {
    if (this.trail.length < 2) return;

    ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < this.trail.length; i++) {
      const point = this.trail[i];
      const alpha = i / this.trail.length;

      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }

    ctx.stroke();
  }

  drawBird(ctx) {
    ctx.save();

    // Handle invulnerability flashing
    if (this.invulnerable && Math.floor(this.invulnerabilityTimer / 5) % 2) {
      ctx.globalAlpha = 0.5;
    }

    // Use rotation from physics
    const rotation = this.rotation;

    // Draw bird with rotation
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(rotation);

    if (this.birdImage.complete) {
      ctx.drawImage(
        this.birdImage,
        -this.size / 2,
        -this.size / 2,
        this.size,
        this.size
      );
    }

    ctx.restore();
  }

  drawPowerParticles(ctx) {
    for (const particle of this.powerParticles) {
      ctx.save();
      ctx.globalAlpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
