import { CONFIG } from "../config.js";
export class Pipe {
  constructor(x) {
    this.x = x;
    this.passed = false;

    // Random gap position
    const minTopHeight = 50;
    const maxTopHeight =
      CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - CONFIG.PIPE_GAP - 50;
    this.topHeight = Math.floor(
      Math.random() * (maxTopHeight - minTopHeight) + minTopHeight
    );

    // Pipe colors
    this.color = "#3CB371"; // Medium sea green
    this.capColor = "#2E8B57"; // Sea green
  }

  // Update pipe position
  update() {
    this.x -= CONFIG.PIPE_SPEED;
  }

  // Draw the pipe on the canvas
  draw(ctx) {
    // Draw top pipe
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, 0, CONFIG.PIPE_WIDTH, this.topHeight);

    // Draw top pipe cap
    ctx.fillStyle = this.capColor;
    ctx.fillRect(this.x - 5, this.topHeight - 20, CONFIG.PIPE_WIDTH + 10, 20);

    // Draw bottom pipe
    const bottomPipeY = this.topHeight + CONFIG.PIPE_GAP;
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x,
      bottomPipeY,
      CONFIG.PIPE_WIDTH,
      CONFIG.CANVAS_HEIGHT - bottomPipeY
    );

    // Draw bottom pipe cap
    ctx.fillStyle = this.capColor;
    ctx.fillRect(this.x - 5, bottomPipeY, CONFIG.PIPE_WIDTH + 10, 20);
  }

  // Check if pipe is off screen
  isOffScreen() {
    return this.x + CONFIG.PIPE_WIDTH < 0;
  }
}
