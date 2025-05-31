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
    private isPretraining: boolean;
    private canvasInitialized: boolean;

    constructor() {
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        this.staticObjects = [];
        this.neuralNetwork = new NeuralNetwork();
        this.isPretraining = true;
        this.canvasInitialized = false;
        
        // Start with pretraining screen instead of canvas
        this.startPretrainingFlow();
    }

    private async startPretrainingFlow(): Promise<void> {
        // Show pretraining interface
        this.showPretrainingScreen();
        
        // Check if we have a pretrained network from the pretraining page
        if ((window as any).pretrainedNetwork) {
            console.log('✅ Using pretrained network from pretraining page');
            this.neuralNetwork = (window as any).pretrainedNetwork;
            this.completePretraining();
            return;
        }
        
        // Otherwise, run auto-pretraining
        console.log('🚀 Starting automatic pretraining...');
        await this.runAutoPretraining();
    }

    private showPretrainingScreen(): void {
        const container = document.getElementById('canvas-container');
        if (container) {
            container.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px;
                    border-radius: 10px;
                    text-align: center;
                    color: white;
                    min-height: 400px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                ">
                    <h2 style="margin-bottom: 20px;">🧠 Neural Network Initialization</h2>
                    <p style="font-size: 1.1em; margin-bottom: 30px;">
                        Preparing the neural network with basic object knowledge...
                    </p>
                    <div id="pretraining-status" style="
                        background: rgba(255,255,255,0.1);
                        padding: 20px;
                        border-radius: 5px;
                        font-family: monospace;
                        text-align: left;
                        margin-bottom: 20px;
                    ">
                        Initializing neural network...
                    </div>
                    <button id="skip-pretraining" style="
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 10px;
                    " onclick="window.skipPretraining()">
                        Skip Pretraining (Start with Empty Network)
                    </button>
                </div>
            `;
        }
        
        // Add skip function to window
        (window as any).skipPretraining = () => {
            this.completePretraining();
        };
    }

    private updatePretrainingStatus(message: string): void {
        const statusElement = document.getElementById('pretraining-status');
        if (statusElement) {
            statusElement.textContent += message + '\n';
            statusElement.scrollTop = statusElement.scrollHeight;
        }
    }

    private async runAutoPretraining(): Promise<void> {
        try {
            this.updatePretrainingStatus('📊 Generating synthetic training data...');
            
            // Create static objects for pretraining
            const staticObjects = [
                new Circle(200, 150, 60),
                new Square(600, 200, 80),
                new Diamond(400, 450, 70)
            ];
            
            // Wait a bit for visual feedback
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.updatePretrainingStatus('🎯 Training network to be interested in objects...');
            
            // Run pretraining
            await this.neuralNetwork.pretrainObjectInterest(this.canvasWidth, this.canvasHeight, staticObjects);
            
            // Mark as ready
            this.neuralNetwork.markAsReady();
            
            this.updatePretrainingStatus('✅ Pretraining completed successfully!');
            this.updatePretrainingStatus('🎮 Starting main application...');
            
            // Wait a bit before transitioning
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Complete pretraining and start main app
            this.completePretraining();
            
        } catch (error) {
            console.error('Pretraining failed:', error);
            this.updatePretrainingStatus(`❌ Pretraining failed: ${error}`);
            this.updatePretrainingStatus('🔄 Starting with empty network...');
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.completePretraining();
        }
    }

    private completePretraining(): void {
        this.isPretraining = false;
        this.setupCanvas();
        this.createObjects();
        
        // Delay control setup to ensure DOM is ready
        setTimeout(() => {
            this.setupControlButtons();
        }, 100);
    }

    private setupCanvas(): void {
        if (this.canvasInitialized) return;
        
        this.canvas = createCanvas(this.canvasWidth, this.canvasHeight);
        this.canvas.parent('canvas-container');
        this.canvasInitialized = true;
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
        
        console.log('🎮 Game environment ready! Neural network state:', {
            isReady: this.neuralNetwork.isNetworkReady(),
            trainingDataSize: this.neuralNetwork.getStats().dataSize
        });
    }

    private setupControlButtons(): void {
        console.log('Setting up control buttons...');
        const rewardButton = document.getElementById('reward-btn');
        const punishButton = document.getElementById('punish-btn');
        const punishmentToggle = document.getElementById('punishment-toggle') as HTMLInputElement;
        const statusDiv = document.getElementById('status');
        
        console.log('Elements found:', {
            rewardButton: !!rewardButton,
            punishButton: !!punishButton,
            punishmentToggle: !!punishmentToggle,
            statusDiv: !!statusDiv
        });
        
        // Handle punishment mode toggle
        if (punishmentToggle && punishButton) {
            console.log('Setting up punishment toggle event listener');
            punishmentToggle.addEventListener('change', () => {
                console.log('Punishment toggle changed:', punishmentToggle.checked);
                if (punishmentToggle.checked) {
                    punishButton.style.display = 'inline-block';
                } else {
                    punishButton.style.display = 'none';
                }
            });
        } else {
            console.error('Missing elements for punishment toggle:', {
                punishmentToggle: !!punishmentToggle,
                punishButton: !!punishButton
            });
        }
        
        // Handle reward button
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
        
        // Handle punish button
        if (punishButton && statusDiv) {
            punishButton.addEventListener('click', () => {
                // Punish the agent
                this.agent.punish();
                
                // Log punishment event with neural network stats
                const stats = this.agent.getNeuralNetworkStats();
                console.log('❌ PUNISHMENT EVENT ❌');
                console.log('Agent State:', this.agent.getCurrentState().map(x => x.toFixed(3)));
                console.log('Agent Action:', this.agent.getLastAction().map(x => x.toFixed(3)));
                console.log('Training Data Size:', stats.dataSize);
                console.log('Is Training:', stats.isTraining);
                
                // Update status display
                statusDiv.textContent = `Agent punished! Training data: ${stats.dataSize} examples`;
                statusDiv.className = 'status punished';
                
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
        // Don't draw anything if we're still pretraining or canvas isn't ready
        if (this.isPretraining || !this.canvasInitialized || !this.agent) {
            return;
        }
        
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
