export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  // Add particles at a position
  addParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        size: 2 + Math.random() * 5,
        color: color || "#FFD700",
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 30 + Math.random() * 30,
      });
    }
  }

  // Update all particles
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // Draw all particles
  draw(ctx) {
    for (const p of this.particles) {
      const alpha = p.life / 60;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
