import { CONFIG } from "../config.js";

export class Background {
  constructor(game) {
    this.game = game;
    this.layers = [
      { img: this.createCloudLayer(), y: 0, speed: 3 },
      {
        img: this.createMountainLayer(),
        y: CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - 120,
        speed: 4,
      },
      {
        img: this.createGroundLayer(),
        y: CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT,
        speed: 4,
      },
    ];
    this.offsets = [0, 0, 0];
  }

  createCloudLayer() {
    const canvas = document.createElement("canvas");
    canvas.width = CONFIG.CANVAS_WIDTH * 2;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#87CEEB"; // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    // Draw clouds
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * 100;
      const size = 30 + Math.random() * 40;

      // Draw cloud puffs
      for (let j = 0; j < 5; j++) {
        const offsetX = ((j - 2) * size) / 3;
        const offsetY = (Math.random() - 0.5) * 10;
        const radius = size / 2 - Math.abs(j - 2) * 5;
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    return canvas;
  }
  createMountainLayer() {
    const canvas = document.createElement("canvas");
    canvas.width = CONFIG.CANVAS_WIDTH * 2;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#6B8E23"; // Olive drab

    // Draw mountains
    for (let i = 0; i < 6; i++) {
      const x = (i * canvas.width) / 3;
      const height = 80 + Math.random() * 70;

      ctx.beginPath();
      ctx.moveTo(x - 50, canvas.height);
      ctx.lineTo(x + canvas.width / 6, canvas.height - height);
      ctx.lineTo(x + canvas.width / 3 + 50, canvas.height);
      ctx.closePath();
      ctx.fill();
    }

    return canvas;
  }

  createGroundLayer() {
    const canvas = document.createElement("canvas");
    canvas.width = CONFIG.CANVAS_WIDTH * 2;
    canvas.height = CONFIG.GROUND_HEIGHT;
    const ctx = canvas.getContext("2d");

    // Main ground
    ctx.fillStyle = "#DEB887"; // Burlywood
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grass top
    ctx.fillStyle = "#8FBC8F"; // Dark sea green
    ctx.fillRect(0, 0, canvas.width, 20);

    // Dirt patterns
    ctx.fillStyle = "#A0522D"; // Sienna
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = 20 + Math.random() * (canvas.height - 20);
      const size = 3 + Math.random() * 5;
      ctx.fillRect(x, y, size, size);
    }

    return canvas;
  }

  update() {
    // Update layer positions
    for (let i = 0; i < this.layers.length; i++) {
      this.offsets[i] =
        (this.offsets[i] + this.layers[i].speed) % this.layers[i].img.width;
    }
  }

  draw(ctx) {
    // Clear the canvas with sky color
    ctx.fillStyle = "#71BCE1";
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Draw each background layer
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];

      ctx.drawImage(
        layer.img,
        this.offsets[i],
        0,
        CONFIG.CANVAS_WIDTH,
        layer.img.height,
        0,
        layer.y,
        CONFIG.CANVAS_WIDTH,
        layer.img.height
      );

      // Draw the wrapping part
      if (this.offsets[i] > 0) {
        ctx.drawImage(
          layer.img,
          0,
          0,
          this.offsets[i],
          layer.img.height,
          CONFIG.CANVAS_WIDTH - this.offsets[i],
          layer.y,
          this.offsets[i],
          layer.img.height
        );
      }
      // Reset opacity
      ctx.globalAlpha = 1;
    }
  }
}
