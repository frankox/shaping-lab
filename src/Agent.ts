import { Position, Velocity, Drawable } from './types.js';

export class Agent implements Drawable {
    public position: Position;
    private velocity: Velocity;
    private size: number;
    private color: string;
    private canvasWidth: number;
    private canvasHeight: number;
    private trail: Position[];
    private maxTrailLength: number;

    constructor(x: number, y: number, canvasWidth: number, canvasHeight: number) {
        this.position = { x, y };
        this.velocity = { dx: 0, dy: 0 };
        this.size = 12;
        this.color = '#ff4757';
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.trail = [];
        this.maxTrailLength = 20;
        this.generateRandomVelocity();
    }

    private generateRandomVelocity(): void {
        // Generate random velocity between -2 and 2
        this.velocity.dx = (Math.random() - 0.5) * 4;
        this.velocity.dy = (Math.random() - 0.5) * 4;
    }

    public update(): void {
        // Update position
        this.position.x += this.velocity.dx;
        this.position.y += this.velocity.dy;

        // Add current position to trail
        this.trail.push({ x: this.position.x, y: this.position.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Bounce off walls
        if (this.position.x <= this.size || this.position.x >= this.canvasWidth - this.size) {
            this.velocity.dx *= -1;
            this.position.x = Math.max(this.size, Math.min(this.canvasWidth - this.size, this.position.x));
        }
        
        if (this.position.y <= this.size || this.position.y >= this.canvasHeight - this.size) {
            this.velocity.dy *= -1;
            this.position.y = Math.max(this.size, Math.min(this.canvasHeight - this.size, this.position.y));
        }

        // Occasionally change direction randomly
        if (Math.random() < 0.02) {
            this.generateRandomVelocity();
        }
    }

    public draw(): void {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i / this.trail.length) * 100;
            fill(255, 71, 87, alpha);
            noStroke();
            circle(this.trail[i].x, this.trail[i].y, this.size * (i / this.trail.length) * 0.5);
        }

        // Draw agent
        fill(this.color);
        stroke(255);
        strokeWeight(2);
        circle(this.position.x, this.position.y, this.size * 2);
        
        // Draw direction indicator
        const arrowLength = 15;
        const angle = Math.atan2(this.velocity.dy, this.velocity.dx);
        const arrowX = this.position.x + Math.cos(angle) * arrowLength;
        const arrowY = this.position.y + Math.sin(angle) * arrowLength;
        
        stroke(255);
        strokeWeight(3);
        line(this.position.x, this.position.y, arrowX, arrowY);
    }

    public reward(): void {
        // Visual feedback for reward
        this.color = '#2ed573';
        this.size = 16;
        
        // Reset after a short time
        setTimeout(() => {
            this.color = '#ff4757';
            this.size = 12;
        }, 1000);
    }
}
