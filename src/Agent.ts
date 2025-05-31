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
    private lastDirectionChange: number;
    private directionChangeInterval: number;
    private curiosityFactor: number;

    constructor(x: number, y: number, canvasWidth: number, canvasHeight: number, neuralNetwork: NeuralNetwork) {
        this.position = { x, y };
        this.velocity = { dx: 0, dy: 0 };
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
        this.predictionInterval = 300;
        this.isUpdatingVelocity = false;
        this.lastDirectionChange = 0;
        this.directionChangeInterval = 8000 + Math.random() * 7000;
        this.curiosityFactor = 0.02 + Math.random() * 0.03;
        
        const initialMovement = this.generateSmoothMovement();
        this.velocity.dx = initialMovement.dx;
        this.velocity.dy = initialMovement.dy;
    }

    public setStaticObjects(objects: Array<{position: Position, getSize?: () => number, getType?: () => string, getBoundingRadius?: () => number}>): void {
        this.staticObjects = objects;
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

    // Neural network integration
    private async updateVelocityWithNeuralNetwork(): Promise<void> {
        if (this.staticObjects.length === 0) {
            const smoothMovement = this.generateSmoothMovement();
            this.velocity.dx = smoothMovement.dx;
            this.velocity.dy = smoothMovement.dy;
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
            const movement = await this.neuralNetwork.predict(this.currentState);
            const explorationFactor = 0.05;
            const smoothMovement = this.generateSmoothMovement();
            
            this.velocity.dx = movement.dx * (1 - explorationFactor) + smoothMovement.dx * explorationFactor;
            this.velocity.dy = movement.dy * (1 - explorationFactor) + smoothMovement.dy * explorationFactor;
            this.lastAction = [this.velocity.dx, this.velocity.dy];

        } catch (error) {
            console.warn('Neural network prediction failed, using smooth movement:', error);
            const smoothMovement = this.generateSmoothMovement();
            this.velocity.dx = smoothMovement.dx;
            this.velocity.dy = smoothMovement.dy;
            this.lastAction = [smoothMovement.dx, smoothMovement.dy];
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

    // Main update loop
    public update(): void {
        const now = Date.now();
        
        if (now - this.lastPredictionTime > this.predictionInterval && !this.isUpdatingVelocity) {
            this.updateVelocityAsync();
        }

        if (now - this.lastDirectionChange > this.directionChangeInterval) {
            const smoothMovement = this.generateSmoothMovement();
            this.velocity.dx += smoothMovement.dx * (this.curiosityFactor * 0.2);
            this.velocity.dy += smoothMovement.dy * (this.curiosityFactor * 0.2);
            
            this.lastDirectionChange = now;
            this.directionChangeInterval = 10000 + Math.random() * 10000;
        }

        this.position.x += this.velocity.dx;
        this.position.y += this.velocity.dy;
        
        const minSpeed = 0.3;
        const currentSpeed = Math.sqrt(this.velocity.dx * this.velocity.dx + this.velocity.dy * this.velocity.dy);
        if (currentSpeed < minSpeed) {
            const randomBoost = this.generateSmoothMovement();
            this.velocity.dx += randomBoost.dx * 0.05;
            this.velocity.dy += randomBoost.dy * 0.05;
        }
        
        const maxSpeed = 3.0;
        if (currentSpeed > maxSpeed) {
            this.velocity.dx = (this.velocity.dx / currentSpeed) * maxSpeed;
            this.velocity.dy = (this.velocity.dy / currentSpeed) * maxSpeed;
        }

        this.trail.push({ x: this.position.x, y: this.position.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }

        this.handleWallAvoidance();
    }

    // Wall avoidance system
    private handleWallAvoidance(): void {
        const wallBuffer = 60;
        const pushStrength = 2.5;
        let needsPush = false;
        
        const distToLeft = this.position.x;
        const distToRight = this.canvasWidth - this.position.x;
        const distToTop = this.position.y;
        const distToBottom = this.canvasHeight - this.position.y;
        
        if (distToLeft < wallBuffer) {
            this.velocity.dx += pushStrength * (wallBuffer - distToLeft) / wallBuffer;
            needsPush = true;
        }
        if (distToRight < wallBuffer) {
            this.velocity.dx -= pushStrength * (wallBuffer - distToRight) / wallBuffer;
            needsPush = true;
        }
        if (distToTop < wallBuffer) {
            this.velocity.dy += pushStrength * (wallBuffer - distToTop) / wallBuffer;
            needsPush = true;
        }
        if (distToBottom < wallBuffer) {
            this.velocity.dy -= pushStrength * (wallBuffer - distToBottom) / wallBuffer;
            needsPush = true;
        }

        if (this.position.x <= this.size || this.position.x >= this.canvasWidth - this.size) {
            this.velocity.dx *= -0.8;
            this.position.x = Math.max(this.size, Math.min(this.canvasWidth - this.size, this.position.x));
            
            if (this.position.x <= this.size) {
                this.velocity.dx += 1.5;
            } else {
                this.velocity.dx -= 1.5;
            }
        }
        
        if (this.position.y <= this.size || this.position.y >= this.canvasHeight - this.size) {
            this.velocity.dy *= -0.8;
            this.position.y = Math.max(this.size, Math.min(this.canvasHeight - this.size, this.position.y));
            
            if (this.position.y <= this.size) {
                this.velocity.dy += 1.5;
            } else {
                this.velocity.dy -= 1.5;
            }
        }

        if (needsPush) {
            const centerX = this.canvasWidth / 2;
            const centerY = this.canvasHeight / 2;
            const towardsCenterX = centerX - this.position.x;
            const towardsCenterY = centerY - this.position.y;
            const distance = Math.sqrt(towardsCenterX * towardsCenterX + towardsCenterY * towardsCenterY);
            
            if (distance > 0) {
                const centerAttraction = 0.8;
                this.velocity.dx += (towardsCenterX / distance) * centerAttraction;
                this.velocity.dy += (towardsCenterY / distance) * centerAttraction;
            }
        }
    }

    // Rendering
    public draw(): void {
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = (i / this.trail.length) * 120;
            fill(255, 71, 87, alpha);
            noStroke();
            const trailSize = this.size * (i / this.trail.length) * 0.8;
            circle(this.trail[i].x, this.trail[i].y, trailSize);
        }

        fill(this.color);
        stroke(255);
        strokeWeight(2);
        
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

    // Training methods
    public reward(): void {
        if (this.currentState.length > 0 && this.lastAction.length > 0) {
            this.neuralNetwork.recordReward(this.currentState, this.lastAction);
            console.log('🎉 Agent rewarded! Learning from this behavior...');
            this.neuralNetwork.maybeTrainModel();
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
            this.neuralNetwork.recordPunishment(this.currentState, this.lastAction);
            console.log('❌ Agent punished! Learning to avoid this behavior...');
            this.neuralNetwork.maybeTrainModel();
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
