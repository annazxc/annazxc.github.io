import { CONFIG } from "../config.js";

export class PowerUp {
  //heart or star
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.type = Math.random() < 0.5 ? "life" : "power";
    this.collected = false;
    this.angle = 0;
    this.opacity = 1;
    this.collectionAnimation = false;
    this.animationFrame = 0;
  }

  update() {
    this.x -= CONFIG.PIPE_SPEED * 0.6; // Move slower than pipes
    this.angle += 0.05; // Rotate

    //collection animation
    if (this.collectionAnimation) {
      this.animationFrame++;
      this.size += 1;
      this.opacity -= 0.05;

      // Remove after animation completes
      if (this.opacity <= 0) {
        this.collected = true;
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate(this.angle);

    if (this.type === "life") {
      // Draw heart
      ctx.fillStyle = "#FF5555";
      ctx.beginPath();
      ctx.moveTo(0, -this.size / 4);
      ctx.bezierCurveTo(
        this.size / 4,
        -this.size / 2,
        this.size / 2,
        -this.size / 4,
        0,
        this.size / 4
      );
      ctx.bezierCurveTo(
        -this.size / 2,
        -this.size / 4,
        -this.size / 4,
        -this.size / 2,
        0,
        -this.size / 4
      );
      ctx.fill();

      // Add glow effect
      if (!this.collectionAnimation) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#FF5555";
      }
    } else {
      // Draw power star
      ctx.fillStyle = "#FFCC00";
      const spikes = 5;
      const outerRadius = this.size / 2;
      const innerRadius = this.size / 4;

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * 2 * i) / (spikes * 2) - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();

      // Add glow effect
      if (!this.collectionAnimation) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#FFCC00";
      }
    }

    ctx.restore();
  }

  // Start collection animation instead of immediate removal
  startCollectionAnimation() {
    this.collectionAnimation = true;
  }

  // Check collision with bird
  collidesWith(bird) {
    if (this.collectionAnimation) return false;

    const birdCenterX = bird.x + bird.size / 2;
    const birdCenterY = bird.y + bird.size / 2;
    const powerUpCenterX = this.x + this.size / 2;
    const powerUpCenterY = this.y + this.size / 2;

    const distance = Math.sqrt(
      Math.pow(birdCenterX - powerUpCenterX, 2) +
        Math.pow(birdCenterY - powerUpCenterY, 2)
    );

    return distance < bird.size / 2 + this.size / 2;
  }

  // Check if power-up is off screen
  isOffScreen() {
    return this.x + this.size < 0;
  }
}

export class PowerUpManager {
  constructor(game) {
    this.game = game;
    this.nextPowerUpFrame = CONFIG.POWERUP_INITIAL_DELAY;
  }

  update() {
    this.generatePowerUp();
    this.updatePowerUps();
  }

  generatePowerUp() {
    // Only generate power-ups after player has scored some points
    if (this.game.score < 1) return;

    this.nextPowerUpFrame--;
    if (this.nextPowerUpFrame <= 0) {
      // Position power-up between pipes
      const x = CONFIG.CANVAS_WIDTH;
      const y =
        100 +
        Math.random() * (CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - 200);

      this.game.powerUps.push(new PowerUp(x, y));

      const minInterval = CONFIG.POWERUP_MIN_INTERVAL;
      const maxInterval = CONFIG.POWERUP_MAX_INTERVAL;
      this.nextPowerUpFrame =
        minInterval + Math.floor(Math.random() * (maxInterval - minInterval));
    }
  }

  updatePowerUps() {
    for (let i = this.game.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.game.powerUps[i];
      powerUp.update();

      // Remove off-screen power-ups or fully collected ones
      if (powerUp.isOffScreen() || powerUp.collected) {
        this.game.powerUps.splice(i, 1);
        continue;
      }

      // Check for collision with bird
      if (
        !powerUp.collectionAnimation &&
        this.game.bird.alive &&
        powerUp.collidesWith(this.game.bird)
      ) {
        // Start visual collection animation instead of immediate removal
        powerUp.startCollectionAnimation();
        this.applyPowerUpEffect(powerUp);
        this.game.sound.play("powerUp");
      }
    }
  }

  applyPowerUpEffect(powerUp) {
    const effects = {
      life: () => {
        if (this.game.bird.lives < 5) {
          this.game.bird.lives++;
          this.game.uiManager.updateLifeDisplay(this.game.bird.lives);
          this.game.uiManager.showPowerUpMessage("+1 LIFE", "#FF5555");
        }
      },
      power: () => {
        this.game.bird.power = this.game.bird.maxPower;
        const powerFill = document.getElementById("power-fill");
        if (powerFill) {
          powerFill.style.transform = "scaleX(1)";
        }
        this.game.uiManager.showPowerUpMessage("POWER FULL! Press P to use", "#FFCC00");
      },
    };

    if (effects[powerUp.type]) effects[powerUp.type]();
  }
}
