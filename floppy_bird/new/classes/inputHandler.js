export class InputHandler {
  constructor(game) {
    this.game = game;
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      power: false
    };
  }

  setupEventListeners() {
    window.addEventListener("keydown", (e) => {
      this.handleKeyDown(e);
    });

    window.addEventListener("keyup", (e) => {
      this.handleKeyUp(e);
    });

    // Click control
    this.game.canvas.addEventListener("click", () => {
      if (!this.game.active) {
        this.game.resetGame();
      } else {
        this.game.bird.physics.flap();
      }
    });
  }

  handleKeyDown(e) {
    // Start the game on first key press
    if (!this.game.gameStarted && this.game.active) {
      this.game.gameStarted = true;
      // Hide tutorial after some time
      setTimeout(() => {
        const tutorial = document.getElementById("tutorial");
        if (tutorial) {
          tutorial.style.opacity = "0";
        }
      }, 5000);
    }

    switch (e.key) {
      case " ":
      case "ArrowUp":
        e.preventDefault();
        this.keys.up = true;
        this.game.bird.physics.flap();
        break;
      case "ArrowDown":
        this.keys.down = true;
        break;
      case "ArrowLeft":
        e.preventDefault();
        this.keys.left = true;
        break;
      case "ArrowRight":
        e.preventDefault();
        this.keys.right = true;
        break;
      case "p":
      case "P":
        e.preventDefault();
        if (this.game.bird.power === this.game.bird.maxPower) {
          this.game.bird.usePower();
          this.game.sound.play("powerUp");
        }
        break;
      case "s":
      case "S":
        //not complete
        break;

      case "Enter":
        if (!this.game.active) {
          this.game.resetGame();
        }
        break;
    }
  }

  handleKeyUp(e) {
    switch (e.key) {
      case " ":
      case "ArrowUp":
        this.keys.up = false;
        break;
      case "ArrowDown":
        this.keys.down = false;
        break;
      case "ArrowLeft":
        this.keys.left = false;
        break;
      case "ArrowRight":
        this.keys.right = false;
        break;
    }
  }
}
