import { Agent } from './Agent.js';
import { Circle, Square, Diamond } from './StaticObjects.js';
import { Drawable } from './types.js';

export class Environment {
    private canvas: any;
    private agent!: Agent;  // Using definite assignment assertion
    private staticObjects: Drawable[];
    private canvasWidth: number;
    private canvasHeight: number;

    constructor() {
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        this.staticObjects = [];
        this.setupCanvas();
        this.createObjects();
        this.setupRewardButton();
    }

    private setupCanvas(): void {
        this.canvas = createCanvas(this.canvasWidth, this.canvasHeight);
        this.canvas.parent('canvas-container');
    }

    private createObjects(): void {
        // Create agent at center
        this.agent = new Agent(
            this.canvasWidth / 2,
            this.canvasHeight / 2,
            this.canvasWidth,
            this.canvasHeight
        );

        // Create static objects
        this.staticObjects = [
            new Circle(150, 150, 60),
            new Square(650, 150, 70),
            new Diamond(400, 450, 80)
        ];
    }

    private setupRewardButton(): void {
        const rewardButton = document.getElementById('reward-btn');
        const statusElement = document.getElementById('status');
        
        if (rewardButton && statusElement) {
            rewardButton.addEventListener('click', () => {
                this.agent.reward();
                console.log('🎉 Agent rewarded at position:', this.agent.position);
                
                // Update status
                statusElement.textContent = '🎉 Agent rewarded! Great job!';
                statusElement.classList.add('rewarded');
                
                // Reset status after 2 seconds
                setTimeout(() => {
                    statusElement.textContent = 'Agent is exploring...';
                    statusElement.classList.remove('rewarded');
                }, 2000);
            });
        }
    }

    public update(): void {
        this.agent.update();
    }

    public draw(): void {
        // Background gradient
        for (let i = 0; i <= this.canvasHeight; i++) {
            const inter = map(i, 0, this.canvasHeight, 0, 1);
            const c = lerpColor(color(45, 55, 72), color(26, 32, 44), inter);
            stroke(c);
            line(0, i, this.canvasWidth, i);
        }

        // Draw static objects
        this.staticObjects.forEach(obj => obj.draw());

        // Draw agent last (on top)
        this.agent.draw();

        // Draw UI elements
        this.drawInfo();
    }

    private drawInfo(): void {
        // Draw position info
        fill(255, 255, 255, 200);
        noStroke();
        rect(10, 10, 200, 60, 10);
        
        fill(0);
        textSize(14);
        textAlign(LEFT);
        text(`Agent Position:`, 20, 30);
        text(`X: ${Math.round(this.agent.position.x)}`, 20, 45);
        text(`Y: ${Math.round(this.agent.position.y)}`, 20, 60);
    }
}

// Global variables for p5.js
let environment: Environment;

// p5.js setup function
(window as any).setup = function() {
    environment = new Environment();
};

// p5.js draw function
(window as any).draw = function() {
    environment.update();
    environment.draw();
};
