import { Position, Velocity, Drawable } from './types.js';
import { NeuralNetwork } from './NeuralNetwork.js';

export class Agent implements Drawable {
    public position: Position;
    private velocity: Velocity;
    private size: number;
    private color: string;
    private canvasWidth: number;
    private canvasHeight: number;
    private trail: Position[];
    private maxTrailLength: number;
    private neuralNetwork: NeuralNetwork;
    private currentState: number[];
    private lastAction: number[];
    private lastPredictionTime: number;
    private predictionInterval: number;
    private isUpdatingVelocity: boolean;
    private staticObjects: Array<{position: Position, getSize?: () => number, getType?: () => string, getBoundingRadius?: () => number}>;

    constructor(x: number, y: number, canvasWidth: number, canvasHeight: number, neuralNetwork: NeuralNetwork) {
        this.position = { x, y };
        this.velocity = { dx: 0, dy: 0 }; // Start with no movement
        this.size = 12;
        this.color = '#ff4757';
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.trail = [];
        this.maxTrailLength = 30;
        this.neuralNetwork = neuralNetwork;
        this.currentState = [];
        this.lastAction = [0, 0];
        this.staticObjects = [];
        this.lastPredictionTime = 0;
        this.predictionInterval = 400; // Reduced frequency for better performance
        this.isUpdatingVelocity = false;
        
        // Only initialize movement if neural network is ready
        if (this.neuralNetwork.isNetworkReady()) {
            const initialMovement = this.generateSmoothMovement();
            this.velocity.dx = initialMovement.dx;
            this.velocity.dy = initialMovement.dy;
        }
    }

    public setStaticObjects(objects: Array<{position: Position, getSize?: () => number, getType?: () => string, getBoundingRadius?: () => number}>): void {
        this.staticObjects = objects;
    }

    public startMovement(): void {
        if (this.neuralNetwork.isNetworkReady() && this.velocity.dx === 0 && this.velocity.dy === 0) {
            const initialMovement = this.generateSmoothMovement();
            this.velocity.dx = initialMovement.dx;
            this.velocity.dy = initialMovement.dy;
            console.log('🚀 Agent movement started - neural network is ready!');
        }
    }

    // Movement generation
    private generateSmoothMovement(): {dx: number, dy: number} {
        const baseSpeed = 0.8;
        
        if (Math.abs(this.velocity.dx) > 0.05 || Math.abs(this.velocity.dy) > 0.05) {
            let currentAngle = Math.atan2(this.velocity.dy, this.velocity.dx);
            const angleAdjustment = (Math.random() - 0.5) * 0.05;
            currentAngle += angleAdjustment;
            
            return {
                dx: Math.cos(currentAngle) * baseSpeed,
                dy: Math.sin(currentAngle) * baseSpeed
            };
        } else {
            const angle = Math.random() * Math.PI * 2;
            return {
                dx: Math.cos(angle) * baseSpeed,
                dy: Math.sin(angle) * baseSpeed
            };
        }
    }

    // Neural network integration - PURE AUTONOMOUS CONTROL
    private async updateVelocityWithNeuralNetwork(): Promise<void> {
        if (this.staticObjects.length === 0) {
            // Even without objects, let neural network decide
            const defaultState = this.neuralNetwork.calculateState(
                this.position,
                this.canvasWidth,
                this.canvasHeight,
                [],
                this.velocity
            );
            
            try {
                const movement = await this.neuralNetwork.predict(defaultState);
                
                // Apply gradual rotation for smooth movement
                const rotationSmoothness = 0.15;
                const speedSmoothness = 0.25;
                
                // Blend current velocity with neural network's desired movement
                this.velocity.dx = this.velocity.dx * (1 - rotationSmoothness) + movement.dx * rotationSmoothness;
                this.velocity.dy = this.velocity.dy * (1 - rotationSmoothness) + movement.dy * rotationSmoothness;
                
                // Optimized speed adjustment
                const currentSpeedSq = this.velocity.dx * this.velocity.dx + this.velocity.dy * this.velocity.dy;
                const desiredSpeedSq = movement.dx * movement.dx + movement.dy * movement.dy;
                
                if (currentSpeedSq > 0.0001) {
                    const currentSpeed = Math.sqrt(currentSpeedSq);
                    const desiredSpeed = Math.sqrt(desiredSpeedSq);
                    const targetSpeed = currentSpeed * (1 - speedSmoothness) + desiredSpeed * speedSmoothness;
                    const speedRatio = targetSpeed / currentSpeed;
                    
                    this.velocity.dx *= speedRatio;
                    this.velocity.dy *= speedRatio;
                }
                
                this.lastAction = [movement.dx, movement.dy];
                
                // Record action to temporal memory
                this.neuralNetwork.recordAction(defaultState, this.lastAction);
            } catch (error) {
                console.warn('Neural network prediction failed:', error);
                // Minimal fallback - just basic random movement
                const angle = Math.random() * Math.PI * 2;
                this.velocity.dx = Math.cos(angle) * 1.5;
                this.velocity.dy = Math.sin(angle) * 1.5;
                this.lastAction = [this.velocity.dx, this.velocity.dy];
                
                // Record fallback action to temporal memory
                this.neuralNetwork.recordAction(defaultState, this.lastAction);
            }
            return;
        }

        this.currentState = this.neuralNetwork.calculateState(
            this.position,
            this.canvasWidth,
            this.canvasHeight,
            this.staticObjects,
            this.velocity
        );

        try {
            // PURE NEURAL NETWORK CONTROL with gradual rotation
            const movement = await this.neuralNetwork.predict(this.currentState);
            
            // Apply gradual rotation instead of direct velocity assignment
            const rotationSmoothness = 0.15; // Lower = smoother rotation, higher = more responsive
            const speedSmoothness = 0.25; // Speed adjustment factor
            
            // Blend current velocity with neural network's desired movement for smooth rotation
            this.velocity.dx = this.velocity.dx * (1 - rotationSmoothness) + movement.dx * rotationSmoothness;
            this.velocity.dy = this.velocity.dy * (1 - rotationSmoothness) + movement.dy * rotationSmoothness;
            
            // Optimized speed adjustment - reduce redundant calculations
            const currentSpeedSq = this.velocity.dx * this.velocity.dx + this.velocity.dy * this.velocity.dy;
            const desiredSpeedSq = movement.dx * movement.dx + movement.dy * movement.dy;
            
            if (currentSpeedSq > 0.0001) { // Avoid division by zero
                const currentSpeed = Math.sqrt(currentSpeedSq);
                const desiredSpeed = Math.sqrt(desiredSpeedSq);
                const targetSpeed = currentSpeed * (1 - speedSmoothness) + desiredSpeed * speedSmoothness;
                const speedRatio = targetSpeed / currentSpeed;
                
                this.velocity.dx *= speedRatio;
                this.velocity.dy *= speedRatio;
            }
            
            this.lastAction = [movement.dx, movement.dy]; // Record original neural network output
            
            // Record action to temporal memory for automatic reward/punishment
            this.neuralNetwork.recordAction(this.currentState, this.lastAction);

        } catch (error) {
            console.warn('Neural network prediction failed, minimal fallback:', error);
            // Minimal fallback that doesn't interfere with learning
            const angle = Math.random() * Math.PI * 2;
            this.velocity.dx = Math.cos(angle) * 1.5;
            this.velocity.dy = Math.sin(angle) * 1.5;
            this.lastAction = [this.velocity.dx, this.velocity.dy];
            
            // Record fallback action to temporal memory as well
            this.neuralNetwork.recordAction(this.currentState, this.lastAction);
        }
    }

    private async updateVelocityAsync(): Promise<void> {
        this.isUpdatingVelocity = true;
        this.lastPredictionTime = Date.now();
        
        try {
            await this.updateVelocityWithNeuralNetwork();
        } finally {
            this.isUpdatingVelocity = false;
        }
    }

    // Main update loop - PURE NEURAL NETWORK CONTROL
    public update(): void {
        // Don't update movement if neural network is not ready
        if (!this.neuralNetwork.isNetworkReady()) {
            return;
        }
        
        const now = Date.now();
        
        // More frequent neural network updates for responsive intelligence
        if (now - this.lastPredictionTime > this.predictionInterval && !this.isUpdatingVelocity) {
            this.updateVelocityAsync();
        }

        // Apply neural network movement directly
        this.position.x += this.velocity.dx;
        this.position.y += this.velocity.dy;
        
        // Only essential physics constraints to prevent simulation breaking
        const currentSpeedSq = this.velocity.dx * this.velocity.dx + this.velocity.dy * this.velocity.dy;
        const maxSpeedSq = 16.0; // 4.0 squared to avoid sqrt calculation
        if (currentSpeedSq > maxSpeedSq) {
            const currentSpeed = Math.sqrt(currentSpeedSq);
            const maxSpeed = 4.0;
            this.velocity.dx = (this.velocity.dx / currentSpeed) * maxSpeed;
            this.velocity.dy = (this.velocity.dy / currentSpeed) * maxSpeed;
        }

        // Trail rendering for visualization
        this.trail.push({ x: this.position.x, y: this.position.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        // Only basic wall collision (no artificial movement overrides)
        this.handleBasicWallCollision();
    }

    // Basic wall collision - only prevent agent from leaving canvas
    private handleBasicWallCollision(): void {
        // Hard boundary collision only
        if (this.position.x <= this.size || this.position.x >= this.canvasWidth - this.size) {
            this.velocity.dx *= -0.3; // Gentle bounce
            this.position.x = Math.max(this.size, Math.min(this.canvasWidth - this.size, this.position.x));
        }
        
        if (this.position.y <= this.size || this.position.y >= this.canvasHeight - this.size) {
            this.velocity.dy *= -0.3; // Gentle bounce
            this.position.y = Math.max(this.size, Math.min(this.canvasHeight - this.size, this.position.y));
        }
    }

    // Rendering
    public draw(): void {
        // Draw trail only if neural network is ready
        if (this.neuralNetwork.isNetworkReady()) {
            for (let i = 0; i < this.trail.length; i++) {
                const alpha = (i / this.trail.length) * 120;
                fill(255, 71, 87, alpha);
                noStroke();
                const trailSize = this.size * (i / this.trail.length) * 0.8;
                circle(this.trail[i].x, this.trail[i].y, trailSize);
            }
        }

        // Draw agent body
        if (this.neuralNetwork.isNetworkReady()) {
            // Normal agent appearance when ready
            fill(this.color);
            stroke(255);
            strokeWeight(2);
        } else {
            // Dimmed appearance when not ready
            fill(100, 100, 100, 150);
            stroke(150);
            strokeWeight(2);
        }
        
        circle(this.position.x, this.position.y, this.size * 2);
        
        // Draw directional arrow only if neural network is ready and moving
        if (this.neuralNetwork.isNetworkReady() && (this.velocity.dx !== 0 || this.velocity.dy !== 0)) {
            const arrowLength = 15;
            const angle = Math.atan2(this.velocity.dy, this.velocity.dx);
            const arrowX = this.position.x + Math.cos(angle) * arrowLength;
            const arrowY = this.position.y + Math.sin(angle) * arrowLength;
            
            stroke(0, 0, 0, 100);
            strokeWeight(5);
            line(this.position.x + 1, this.position.y + 1, arrowX + 1, arrowY + 1);
            
            stroke(255);
            strokeWeight(3);
            line(this.position.x, this.position.y, arrowX, arrowY);
        }
        
        // Draw loading indicator when not ready
        if (!this.neuralNetwork.isNetworkReady()) {
            const time = Date.now() * 0.005;
            const pulseSize = this.size + Math.sin(time) * 3;
            
            (window as any).noFill();
            stroke(255, 255, 255, 100);
            strokeWeight(1);
            circle(this.position.x, this.position.y, pulseSize * 2.5);
        }
    }

    // Training methods
    public reward(): void {
        if (this.currentState.length > 0 && this.lastAction.length > 0) {
            // Use new temporal memory system for automatic reward assignment
            this.neuralNetwork.giveManualReward(0.8);
            console.log('🎉 Agent rewarded! Converting recent actions to positive examples...');
        }

        this.color = '#2ed573';
        this.size = 16;
        
        setTimeout(() => {
            this.color = '#ff4757';
            this.size = 12;
        }, 1000);
    }

    public punish(): void {
        if (this.currentState.length > 0 && this.lastAction.length > 0) {
            // Use new temporal memory system for manual punishment with temporal weighting
            this.neuralNetwork.giveManualPunishment(0.6);
            console.log('❌ Agent punished! Converting recent actions to temporally weighted negative examples...');
        }

        this.color = '#ff3742';
        this.size = 8;
        
        setTimeout(() => {
            this.color = '#ff4757';
            this.size = 12;
        }, 1000);
    }

    // Getters
    public getCurrentState(): number[] {
        return [...this.currentState];
    }

    public getLastAction(): number[] {
        return [...this.lastAction];
    }

    public getNeuralNetworkStats(): {dataSize: number, isTraining: boolean, lastTraining: number} {
        return this.neuralNetwork.getStats();
    }
}
