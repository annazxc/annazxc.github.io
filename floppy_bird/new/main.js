import { Game } from "./classes/game.js";

window.onload = () => {
  // Initialize the game
  showWelcomeMessage();
  const game = new Game();
  game.start();
  console.log("Game initialized!");
};

window.addEventListener("beforeunload", () => {
  localStorage.clear();
});

function showWelcomeMessage() {
  alert(
    "Welcome to Happy Flappy Bird!\n\n" +
      "🕹️ Controls:\n" +
      "- Press Space or Up Arrow to fly up\n" +
      "- Use Left/Right Arrows to move\n" +
      "- Press P when power meter is full to have visual effects \n" +
      "⭐ Collect stars to fill the power meter\n" +
      "❤️ Collect hearts to gain extra lives\n" +
      "Click OK to start!"
  );
}
