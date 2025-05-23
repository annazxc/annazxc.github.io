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

    // Special features
    this.type = this.getRandomPipeType();
    this.colorChangeTime = Date.now() + Math.random() * 2000; // Stagger color changes
    this.elongating = false;
    this.elongateDirection = 1;
    this.elongateAmount = 0;

    // Pipe colors
    this.setRandomColor();
    this.capColor = this.darkenColor(this.color, 20);
  }

  getRandomPipeType() {
    // Simplified pipe types - only normal and elongate
    const types = [
      "normal",
      "normal",
      "normal",
      "normal", // 4/7 = ~57% chance for normal pipes
      "elongate",
      "elongate",
      "elongate", // 3/7
    ];
    const randomIndex = Math.floor(Math.random() * types.length);
    return types[randomIndex];
  }
  setRandomColor() {
    const colors = [
      "#3CB371", // Medium sea green
      "#4682B4", // Steel blue
      "#9370DB", // Medium purple
      "#FF6347", // Tomato
      "#FFD700", // Gold
      "#8A2BE2", // Blue violet
      "#20B2AA", // Light sea green
    ];
    // Get different color from last pipe if possible
    let newColor;
    do {
      newColor = colors[Math.floor(Math.random() * colors.length)];
    } while (newColor === this.color && colors.length > 1);

    this.color = newColor;
    this.capColor = this.darkenColor(this.color, 20);
  }

  // Darken a color by a percentage
  darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = ((num >> 8) & 0x00ff) - amt;
    const B = (num & 0x0000ff) - amt;
    return (
      "#" +
      (
        0x1000000 +
        (R < 0 ? 0 : R) * 0x10000 +
        (G < 0 ? 0 : G) * 0x100 +
        (B < 0 ? 0 : B)
      )
        .toString(16)
        .slice(1)
    );
  }

  // Update pipe position and features
  update() {
    this.x -= CONFIG.PIPE_SPEED;

    // Update color if time has passed
    if (Date.now() > this.colorChangeTime) {
      this.setRandomColor();
      this.colorChangeTime = Date.now() + CONFIG.PIPE_COLOR_CHANGE_INTERVAL;
    }

    // Update elongate pipes
    if (this.type === "elongate") {
      // Increase elongation frequency
      if (Math.random() < 0.02 || this.elongating) {
        this.elongating = true;
        this.elongateAmount +=
          CONFIG.PIPE_ELONGATE_SPEED * this.elongateDirection;

        // Change direction if exceeding limits
        if (Math.abs(this.elongateAmount) > 80) {
          this.elongateDirection *= -1;
        }

        // Reduced chance to stop elongating
        if (Math.random() < 0.003) {
          this.elongating = false;
        }
      }
    }
  }

  draw(ctx) {
    // Calculate actual top height with elongation
    const actualTopHeight =
      this.topHeight + (this.type === "elongate" ? this.elongateAmount : 0);

    // Draw top pipe
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, 0, CONFIG.PIPE_WIDTH, actualTopHeight);

    // Draw cap
    ctx.fillStyle = this.capColor;
    ctx.fillRect(this.x - 5, actualTopHeight - 10, CONFIG.PIPE_WIDTH + 10, 10);

    // Draw bottom pipe
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x,
      actualTopHeight + CONFIG.PIPE_GAP,
      CONFIG.PIPE_WIDTH,
      CONFIG.CANVAS_HEIGHT - (actualTopHeight + CONFIG.PIPE_GAP)
    );

    // Draw cap
    ctx.fillStyle = this.capColor;
    ctx.fillRect(
      this.x - 5,
      actualTopHeight + CONFIG.PIPE_GAP,
      CONFIG.PIPE_WIDTH + 10,
      10
    );
  }

  // Check if pipe is off screen
  isOffScreen() {
    return this.x + CONFIG.PIPE_WIDTH < 0;
  }
}
