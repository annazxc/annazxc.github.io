import { CONFIG } from "../config.js";

export class Physics {
  constructor(bird) {
    this.bird = bird;
  }

  apply() {
    this.applyNormal();

    // Update rotation based on velocity
    this.bird.rotation = Math.min(
      Math.PI / 4,
      Math.max(-Math.PI / 4, this.bird.velocityY * 0.05)
    );
  }

  applyNormal() {
    const b = this.bird;

    // Apply gravity
    b.velocityY += CONFIG.GRAVITY;

    // Limit fall speed
    if (b.velocityY > CONFIG.MAX_FALL_SPEED) {
      b.velocityY = CONFIG.MAX_FALL_SPEED;
    }

    // Apply horizontal friction
    b.velocityX *= CONFIG.FRICTION;

    // Update position
    b.y += b.velocityY;
    b.x += b.velocityX;
  }

  flap() {
    if (this.bird.alive && !this.bird.knockback) {
      this.bird.velocityY = CONFIG.JUMP_FORCE;
      this.bird.sound.play("flap");
    }
  }

  moveHorizontal(direction) {
    if (this.bird.alive && !this.bird.knockback) {
      const speed = CONFIG.HORIZONTAL_SPEED;

      // Add to velocity instead of setting it directly for more natural movement
      this.bird.velocityX += direction * speed;

      // Limit horizontal speed
      const maxSpeed = speed * 3;
      this.bird.velocityX = Math.max(
        -maxSpeed,
        Math.min(maxSpeed, this.bird.velocityX)
      );
    }
  }

  setInvulnerable(duration) {
    this.bird.invulnerable = true;
    this.bird.invulnerabilityTimer = duration;
  }
}
