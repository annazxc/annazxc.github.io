export class Sound {
  constructor() {
    this.sounds = {
      flap: new Audio("assets/flap.mp3"),
      score: new Audio("assets/score.mp3"),
      hit: new Audio("assets/hit.mp3"),
      powerUp: new Audio("assets/powerUp.mp3"),
      loseLife: new Audio("assets/loseLife.mp3"),
    };
  }
  play(sound) {
    const audio = this.sounds[sound];
    if (audio instanceof HTMLAudioElement) {
      audio.currentTime = 0;
      audio.play().catch((e) => {
        console.log("Sound play failed:", e);
      });
    }
  }
}
