import { CONFIG } from "../config.js";

export class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.type = Math.random() < 0.5 ? 'life' : 'power';
        this.collected = false;
        this.angle = 0;
    }
    
    update() {
        this.x -= CONFIG.PIPE_SPEED * 0.7; // Move slightly slower than pipes
        this.angle += 0.05; // Rotate the power-up
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.size/2, this.y + this.size/2);
        ctx.rotate(this.angle);
        
        if (this.type === 'life') {
            // Draw heart
            ctx.fillStyle = "#FF5555";
            ctx.beginPath();
            ctx.moveTo(0, -this.size/4);
            ctx.bezierCurveTo(
                this.size/4, -this.size/2,
                this.size/2, -this.size/4,
                0, this.size/4
            );
            ctx.bezierCurveTo(
                -this.size/2, -this.size/4,
                -this.size/4, -this.size/2,
                0, -this.size/4
            );
            ctx.fill();
        } else {
            // Draw power star
            ctx.fillStyle = "#FFCC00";
            const spikes = 5;
            const outerRadius = this.size/2;
            const innerRadius = this.size/4;
            
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (Math.PI * 2 * i) / (spikes * 2) - Math.PI/2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // Check collision with bird
    collidesWith(bird) {
        const birdCenterX = bird.x + bird.size/2;
        const birdCenterY = bird.y + bird.size/2;
        const powerUpCenterX = this.x + this.size/2;
        const powerUpCenterY = this.y + this.size/2;
        
        const distance = Math.sqrt(
            Math.pow(birdCenterX - powerUpCenterX, 2) + 
            Math.pow(birdCenterY - powerUpCenterY, 2)
        );
        
        return distance < (bird.size/2 + this.size/2);
    }
    
    // Check if power-up is off screen
    isOffScreen() {
        return this.x + this.size < 0;
    }
}
