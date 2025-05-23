export class Render {
  constructor(bird, ctx) {
    this.bird = bird;
    this.ctx = ctx;
  }

  draw() {
    const { bird, ctx } = this;
    ctx.save();

    const centerX = bird.x + bird.size / 2;
    const centerY = bird.y + bird.size / 2;

    ctx.translate(centerX, centerY);
    ctx.rotate(bird.rotation);
    ctx.translate(-centerX, -centerY);

    this.drawBirdBody();

    if (bird.invulnerable) {
      if (Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1; // Reset alpha in case it changed
  }

  drawBirdBody() {
    const { ctx } = this;
    const { birdImage, x, y, size } = this.bird;

    if (birdImage.complete) {
      ctx.drawImage(birdImage, x, y, size, size);
    }
  }

  showBounceText() {
    const bounceTexts = ["Bounce!", "Ouch!", "Whoa!"];
    const randomText =
      bounceTexts[Math.floor(Math.random() * bounceTexts.length)];

    const bounceMsg = document.createElement("div");
    bounceMsg.className = "bounce-message";
    bounceMsg.textContent = randomText;
    bounceMsg.style.color = "#8B4513"; // Brown
    bounceMsg.style.position = "absolute";
    bounceMsg.style.left = `${this.bird.x + this.bird.size / 2}px`;
    bounceMsg.style.top = `${this.bird.y - 20}px`;
    bounceMsg.style.fontSize = "18px";
    bounceMsg.style.fontWeight = "bold";
    bounceMsg.style.textShadow = "1px 1px 2px #000";
    bounceMsg.style.transition = "all 0.5s ease-out";

    document.getElementById("game-container").appendChild(bounceMsg);

    // Animate the text
    setTimeout(() => {
      bounceMsg.style.transform = "translateY(-30px)";
      bounceMsg.style.opacity = "0";
    }, 50);

    setTimeout(() => bounceMsg.remove(), 500);
  }
}
