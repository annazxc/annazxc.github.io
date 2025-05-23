import { CONFIG } from "../config.js";

export class CollisionManager {
  constructor(game) {
    this.game = game;
  }

  checkCollisions() {
    // Check pipe collisions
    for (const pipe of this.game.pipes) {
      if (this.checkPipeCollision(pipe)) {
        this.game.loseLife();
        return;
      }
    }
  }

  checkPipeCollision(pipe) {
    const bird = this.game.bird;

    // Skip if bird is not alive or is protected
    if (!bird.alive || bird.invulnerable) {
      return false;
    }

    const birdBounds = this.getBirdBounds(bird);
    const pipeBounds = this.getPipeBounds(pipe);

    // Check collision with top or bottom pipe
    return (
      birdBounds.right > pipeBounds.left &&
      birdBounds.left < pipeBounds.right &&
      (birdBounds.top < pipeBounds.topHeight ||
        birdBounds.bottom > pipeBounds.bottomPipeY)
    );
  }

  getBirdBounds(bird) {
    return {
      left: bird.x,
      right: bird.x + bird.size,
      top: bird.y,
      bottom: bird.y + bird.size,
      centerX: bird.x + bird.size / 2,
      centerY: bird.y + bird.size / 2,
    };
  }

  getPipeBounds(pipe) {
    const actualTopHeight =
      pipe.topHeight + (pipe.type === "elongate" ? pipe.elongateAmount : 0);

    return {
      left: pipe.x,
      right: pipe.x + CONFIG.PIPE_WIDTH,
      topHeight: actualTopHeight,
      bottomPipeY: actualTopHeight + CONFIG.PIPE_GAP,
      centerX: pipe.x + CONFIG.PIPE_WIDTH / 2,
    };
  }

  handleBoundaries() {
    this.handleVerticalBoundaries();
    this.handleHorizontalBoundaries();
  }

  handleVerticalBoundaries() {
    const bird = this.game.bird;

    // Top boundary
    if (bird.y <= 0) {
      bird.y = 0;
      bird.velocityY = 0;
    }

    // Ground boundary
    const groundPos = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - bird.size;
    if (bird.y >= groundPos) {
      if (!bird.hasHitGround) {
        bird.render.showBounceText();
        this.game.sound.play("hit");
        bird.hasHitGround = true;
      }

      bird.y = groundPos;
      bird.velocityY = -bird.velocityY * 0.5;

      // Add random horizontal movement if bird is nearly still
      if (Math.abs(bird.velocityX) < 1) {
        bird.velocityX = (Math.random() - 0.5) * 3;
      }
    } else {
      bird.hasHitGround = false;
    }
  }

  handleHorizontalBoundaries() {
    const bird = this.game.bird;

    // Left boundary
    if (bird.x <= 0) {
      bird.x = 0;
      bird.velocityX = 0;
    }

    // Right boundary
    if (bird.x >= CONFIG.CANVAS_WIDTH - bird.size) {
      bird.x = CONFIG.CANVAS_WIDTH - bird.size;
      bird.velocityX = 0;
    }
  }
}
