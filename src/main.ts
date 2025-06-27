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
    private isLoading: boolean;

    constructor() {
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        this.staticObjects = [];
        this.neuralNetwork = new NeuralNetwork();
        this.isPretraining = false;
        this.canvasInitialized = false;
        this.isLoading = true;
        
        // Check if we have a pretrained network from the pretraining page
        if ((window as any).pretrainedNetwork) {
            console.log('✅ Using pretrained network from pretraining page');
            this.neuralNetwork = (window as any).pretrainedNetwork;
        }
        
        // Start directly with the main application (no automatic pretraining)
        this.completePretraining();
    }

    private completePretraining(): void {
        this.isPretraining = false;
        this.setupCanvas();
        this.createObjects();
        
        // Wait for neural network to be fully ready
        this.waitForNeuralNetwork();
        
        // Delay control setup to ensure DOM is ready
        setTimeout(() => {
            this.setupControlButtons();
        }, 100);
    }

    private async waitForNeuralNetwork(): Promise<void> {
        // Give the neural network a moment to fully initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mark neural network as ready
        this.neuralNetwork.markAsReady();
        
        // Start agent movement now that neural network is ready
        if (this.agent) {
            this.agent.startMovement();
        }
        
        // Wait a bit more to ensure stability
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Neural network is ready, stop loading
        this.isLoading = false;
        
        console.log('🎮 Environment fully initialized! Neural network is ready.');
        
        // Hide loading UI
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
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

    private drawLoadingOverlay(): void {
        if (!this.isLoading) return;
        
        // Semi-transparent overlay
        fill(0, 0, 0, 150);
        noStroke();
        rect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Loading spinner and text
        const centerX = this.canvasWidth / 2;
        const centerY = this.canvasHeight / 2;
        
        // Spinner
        const spinnerRadius = 30;
        const time = Date.now() * 0.003;
        stroke(255);
        strokeWeight(4);
        (window as any).noFill();
        
        // Draw spinning arc
        const arcLength = Math.PI * 1.5;
        const rotation = time % (Math.PI * 2);
        (window as any).arc(centerX, centerY, spinnerRadius * 2, spinnerRadius * 2, rotation, rotation + arcLength);
        
        // Loading text
        fill(255);
        noStroke();
        (window as any).textAlign((window as any).CENTER, (window as any).CENTER);
        textSize(20);
        text('Setting up Neural Network...', centerX, centerY + 60);
        
        textSize(14);
        fill(255, 255, 255, 180);
        text('Please wait while the environment initializes', centerX, centerY + 85);
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
        const memoryStatus = this.agent.getTemporalMemoryStatus();
        
        // Background for stats
        fill(255, 255, 255, 200);
        noStroke();
        rect(10, 10, 300, 140, 10);
        
        // Text
        fill(0);
        textSize(14);
        textAlign(LEFT);
        text(`Agent Position: (${Math.round(this.agent.position.x)}, ${Math.round(this.agent.position.y)})`, 20, 30);
        text(`Training Data: ${stats.dataSize} examples`, 20, 50);
        text(`Neural Network: ${stats.isTraining ? 'Training...' : 'Ready'}`, 20, 70);
        
        // Temporal memory status
        text(`Memory Buffer: ${memoryStatus.bufferSize} states`, 20, 90);
        
        // Time since last training and countdown to neutral feedback
        const timeSinceLastTraining = Math.round(memoryStatus.timeSinceLastTraining / 1000);
        const timeToNeutralFeedback = Math.max(0, 10 - timeSinceLastTraining);
        
        if (timeToNeutralFeedback > 0) {
            fill(255, 140, 0); // Orange color for countdown
            text(`Next neutral feedback in: ${timeToNeutralFeedback}s`, 20, 110);
        } else {
            fill(0, 200, 0); // Green color when ready
            text(`Ready for neutral feedback`, 20, 110);
        }
        
        if (stats.lastTraining > 0) {
            fill(0);
            text(`Last Training: ${timeSinceLastTraining}s ago`, 20, 130);
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
        
        // Update and draw agent only if not loading
        if (!this.isLoading) {
            this.agent.update();
        }
        this.agent.draw();
        
        // Draw loading overlay on top if still loading
        if (this.isLoading) {
            this.drawLoadingOverlay();
        } else {
            // Draw UI on top of everything only when not loading
            this.drawUI();
        }
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
