import { Agent } from './Agent.js';
import { Circle, Square, Diamond } from './StaticObjects.js';
import { Drawable } from './types.js';
import { NeuralNetwork } from './NeuralNetwork.js';

export class Environment {
    private canvas: any;
    private agent!: Agent;  // Using definite assignment assertion
    private staticObjects: Drawable[];
    private canvasWidth: number;
    private canvasHeight: number;
    private neuralNetwork: NeuralNetwork;

    constructor() {
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        this.staticObjects = [];
        this.neuralNetwork = new NeuralNetwork();
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
            this.canvasHeight,
            this.neuralNetwork
        );

        // Create static objects
        this.staticObjects = [
            new Circle(200, 150, 60),
            new Square(600, 200, 80),
            new Diamond(400, 450, 70)
        ];

        // Set static objects reference for the agent (needed for state calculation)
        this.agent.setStaticObjects(this.staticObjects);
        
        // Note: Neural network starts with no pretraining - it learns only from manual rewards
    }

    private setupRewardButton(): void {
        const rewardButton = document.getElementById('reward-btn');
        const statusDiv = document.getElementById('status');
        
        if (rewardButton && statusDiv) {
            rewardButton.addEventListener('click', () => {
                // Reward the agent
                this.agent.reward();
                
                // Log reward event with neural network stats
                const stats = this.agent.getNeuralNetworkStats();
                console.log('🎉 REWARD EVENT 🎉');
                console.log('Agent State:', this.agent.getCurrentState().map(x => x.toFixed(3)));
                console.log('Agent Action:', this.agent.getLastAction().map(x => x.toFixed(3)));
                console.log('Training Data Size:', stats.dataSize);
                console.log('Is Training:', stats.isTraining);
                
                // Update status display
                statusDiv.textContent = `Agent rewarded! Training data: ${stats.dataSize} examples`;
                statusDiv.className = 'status rewarded';
                
                // Reset status after 2 seconds
                setTimeout(() => {
                    statusDiv.textContent = 'Agent is learning...';
                    statusDiv.className = 'status';
                }, 2000);
            });
        }
    }

    private drawBackground(): void {
        // Create a subtle gradient background
        for (let i = 0; i < this.canvasHeight; i += 2) {
            const inter = map(i, 0, this.canvasHeight, 0, 1);
            const c = lerpColor(color(45, 55, 72), color(26, 32, 44), inter);
            stroke(c);
            line(0, i, this.canvasWidth, i);
        }
    }

    private drawUI(): void {
        // Draw neural network stats
        const stats = this.agent.getNeuralNetworkStats();
        
        // Background for stats
        fill(255, 255, 255, 200);
        noStroke();
        rect(10, 10, 250, 100, 10);
        
        // Text
        fill(0);
        textSize(14);
        textAlign(LEFT);
        text(`Agent Position: (${Math.round(this.agent.position.x)}, ${Math.round(this.agent.position.y)})`, 20, 30);
        text(`Training Data: ${stats.dataSize} examples`, 20, 50);
        text(`Neural Network: ${stats.isTraining ? 'Training...' : 'Ready'}`, 20, 70);
        
        if (stats.lastTraining > 0) {
            const timeSince = Math.round((Date.now() - stats.lastTraining) / 1000);
            text(`Last Training: ${timeSince}s ago`, 20, 90);
        }
    }

    public draw(): void {
        // Draw background
        this.drawBackground();
        
        // Draw static objects first (behind agent)
        for (const obj of this.staticObjects) {
            obj.draw();
        }
        
        // Update and draw agent last (on top of everything)
        this.agent.update();
        this.agent.draw();
        
        // Draw UI on top of everything
        this.drawUI();
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
    if (environment) {
        environment.draw();
    }
};
