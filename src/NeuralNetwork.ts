import { Position } from './types.js';

export interface TrainingExample {
    state: number[];
    action: number[];
    reward: number;
    timestamp: number;
}

export class NeuralNetwork {
    private model: any; // TensorFlow.js model
    private trainingData: TrainingExample[];
    private isTraining: boolean;
    private lastTrainingTime: number;

    constructor() {
        this.trainingData = [];
        this.isTraining = false;
        this.lastTrainingTime = 0;
        this.initializeModel();
    }

    /**
     * Initialize the neural network model
     * Enhanced input: [x, y, velocity_x, velocity_y, 
     *                  circle_dist, circle_rel_x, circle_rel_y, circle_approach,
     *                  square_dist, square_rel_x, square_rel_y, square_approach,
     *                  diamond_dist, diamond_rel_x, diamond_rel_y, diamond_approach,
     *                  nearest_wall_dist, wall_direction_x, wall_direction_y] (19 features)
     * Output: [deltaX, deltaY] (2 outputs for movement direction)
     */
    private initializeModel(): void {
        // Create a more sophisticated neural network for object awareness
        this.model = (window as any).tf.sequential({
            layers: [
                // Input layer: 19 features (enhanced spatial awareness)
                (window as any).tf.layers.dense({
                    inputShape: [19],
                    units: 48,
                    activation: 'relu',
                    name: 'hidden1'
                }),
                // Hidden layer 1 - for object detection and spatial reasoning
                (window as any).tf.layers.dense({
                    units: 32,
                    activation: 'relu',
                    name: 'hidden2'
                }),
                // Hidden layer 2 - for movement planning
                (window as any).tf.layers.dense({
                    units: 16,
                    activation: 'relu',
                    name: 'hidden3'
                }),
                // Output layer: 2 outputs (deltaX, deltaY)
                (window as any).tf.layers.dense({
                    units: 2,
                    activation: 'tanh', // tanh gives values between -1 and 1
                    name: 'output'
                })
            ]
        });

        // Compile the model with better optimizer
        this.model.compile({
            optimizer: (window as any).tf.train.adam(0.003), // Even lower learning rate for complex network
            loss: 'meanSquaredError',
            metrics: ['mse']
        });

        console.log('Enhanced neural network initialized with intelligent object detection');
        console.log('Model summary:');
        this.model.summary();
    }

    /**
     * Calculate enhanced state features for intelligent object detection
     */
    public calculateState(
        agentPos: Position, 
        canvasWidth: number, 
        canvasHeight: number,
        staticObjects: Array<{position: Position, getSize?: () => number, getType?: () => string, getBoundingRadius?: () => number}>,
        agentVelocity?: {dx: number, dy: number}
    ): number[] {
        // Normalize agent position to [0, 1]
        const normalizedX = agentPos.x / canvasWidth;
        const normalizedY = agentPos.y / canvasHeight;
        
        // Normalize agent velocity (if provided)
        const maxVelocity = 20.0; // Based on our max speed limit
        const normalizedVelX = agentVelocity ? Math.max(-1, Math.min(1, agentVelocity.dx / maxVelocity)) : 0;
        const normalizedVelY = agentVelocity ? Math.max(-1, Math.min(1, agentVelocity.dy / maxVelocity)) : 0;

        // Calculate enhanced features for each object (distance + relative position + size + approach angle)
        const maxDistance = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
        const objectFeatures: number[] = [];
        
        staticObjects.forEach(obj => {
            const dx = obj.position.x - agentPos.x;
            const dy = obj.position.y - agentPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Normalize distance [0, 1]
            const normalizedDistance = distance / maxDistance;
            
            // Normalize relative position [-1, 1]
            const normalizedRelX = dx / (canvasWidth / 2);
            const normalizedRelY = dy / (canvasHeight / 2);
            
            // Calculate approach angle (how aligned agent velocity is with object direction)
            let approachAlignment = 0;
            if (agentVelocity && distance > 0) {
                const velMag = Math.sqrt(agentVelocity.dx * agentVelocity.dx + agentVelocity.dy * agentVelocity.dy);
                if (velMag > 0) {
                    const dotProduct = (agentVelocity.dx * dx + agentVelocity.dy * dy) / (velMag * distance);
                    approachAlignment = Math.max(-1, Math.min(1, dotProduct)); // Clamp to [-1, 1]
                }
            }
            
            objectFeatures.push(normalizedDistance, normalizedRelX, normalizedRelY, approachAlignment);
        });

        // Calculate distance to nearest wall and direction
        const wallDistances = [
            agentPos.x,                    // left wall
            canvasWidth - agentPos.x,      // right wall
            agentPos.y,                    // top wall
            canvasHeight - agentPos.y      // bottom wall
        ];
        
        const nearestWallDist = Math.min(...wallDistances);
        const normalizedWallDist = nearestWallDist / Math.min(canvasWidth, canvasHeight);
        
        // Direction to center (away from walls)
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const toCenterX = (centerX - agentPos.x) / (canvasWidth / 2);
        const toCenterY = (centerY - agentPos.y) / (canvasHeight / 2);

        return [
            normalizedX, normalizedY,           // Agent position (2)
            normalizedVelX, normalizedVelY,     // Agent velocity (2)
            ...objectFeatures,                  // Object features: 3 objects × 4 features = 12
            normalizedWallDist,                 // Nearest wall distance (1)
            toCenterX, toCenterY                // Direction to center (2)
        ];                                      // Total: 19 features
    }

    /**
     * Predict the next movement direction using the enhanced neural network
     */
    public async predict(state: number[]): Promise<{dx: number, dy: number}> {
        const inputTensor = (window as any).tf.tensor2d([state], [1, 19]); // Updated to 19 features
        const prediction = this.model.predict(inputTensor) as any;
        const output = await prediction.data();
        
        // Clean up tensors
        inputTensor.dispose();
        prediction.dispose();

        // Intelligent movement scaling based on environmental awareness
        const movementScale = 8.0;
        
        // Extract relevant state information for intelligent scaling
        const agentVelX = state[2] * 20; // Denormalize velocity
        const agentVelY = state[3] * 20;
        const currentSpeed = Math.sqrt(agentVelX * agentVelX + agentVelY * agentVelY);
        
        // Get distances to objects (every 4th element starting from index 4)
        const objectDistances = [state[4], state[8], state[12]]; // Circle, Square, Diamond distances
        const nearestObjectDist = Math.min(...objectDistances);
        
        // Reduce prediction strength if already moving fast (momentum consideration)
        const momentumFactor = Math.max(0.3, 1.0 - (currentSpeed / 20.0));
        
        // Increase responsiveness when near objects (object avoidance/attraction)
        const objectProximityFactor = 1.0 + (1.0 - nearestObjectDist) * 0.5;
        
        return {
            dx: output[0] * movementScale * momentumFactor * objectProximityFactor,
            dy: output[1] * movementScale * momentumFactor * objectProximityFactor
        };
    }

    /**
     * Record a positive training example when the user rewards the agent
     */
    public recordReward(state: number[], action: number[]): void {
        const example: TrainingExample = {
            state: [...state],
            action: [...action],
            reward: 1.0,
            timestamp: Date.now()
        };

        this.trainingData.push(example);
        console.log(`Reward recorded! Training data size: ${this.trainingData.length}`);
        console.log('State:', state.map(x => x.toFixed(3)));
        console.log('Action:', action.map(x => x.toFixed(3)));

        // Limit training data size to prevent memory issues
        if (this.trainingData.length > 1000) {
            this.trainingData = this.trainingData.slice(-500); // Keep most recent 500 examples
        }
    }

    /**
     * Record a punishment for negative reinforcement learning
     */
    public recordPunishment(state: number[], action: number[]): void {
        const example: TrainingExample = {
            state: [...state],
            action: [...action],
            reward: -1.0, // Negative reward for punishment
            timestamp: Date.now()
        };

        this.trainingData.push(example);
        console.log(`Punishment recorded! Training data size: ${this.trainingData.length}`);
        console.log('State:', state.map(x => x.toFixed(3)));
        console.log('Action:', action.map(x => x.toFixed(3)));

        // Limit training data size to prevent memory issues
        if (this.trainingData.length > 1000) {
            this.trainingData = this.trainingData.slice(-500); // Keep most recent 500 examples
        }
    }

    /**
     * Trigger training immediately for manual rewards/punishments
     */
    public async maybeTrainModel(): Promise<void> {
        if (this.trainingData.length >= 5 && !this.isTraining) {
            await this.trainModel();
        }
    }

    /**
     * Train the neural network on collected reward data
     */
    private async trainModel(): Promise<void> {
        if (this.trainingData.length < 5 || this.isTraining) {
            return;
        }

        this.isTraining = true;
        this.lastTrainingTime = Date.now();

        console.log(`Training neural network with ${this.trainingData.length} examples...`);

        try {
            // Prepare training data
            const states = this.trainingData.map(example => example.state);
            const actions = this.trainingData.map(example => example.action);

            // Convert to tensors
            const inputTensor = (window as any).tf.tensor2d(states);
            const outputTensor = (window as any).tf.tensor2d(actions);

            // Train the model
            const history = await this.model.fit(inputTensor, outputTensor, {
                epochs: 10,
                batchSize: Math.min(32, this.trainingData.length),
                verbose: 0,
                validationSplit: 0.1
            });

            const finalLoss = history.history.loss[history.history.loss.length - 1];
            console.log(`Training completed. Final loss: ${finalLoss.toFixed(4)}`);

            // Clean up tensors
            inputTensor.dispose();
            outputTensor.dispose();

        } catch (error) {
            console.error('Training failed:', error);
        } finally {
            this.isTraining = false;
        }
    }

    /**
     * Get current training statistics
     */
    public getStats(): {dataSize: number, isTraining: boolean, lastTraining: number} {
        return {
            dataSize: this.trainingData.length,
            isTraining: this.isTraining,
            lastTraining: this.lastTrainingTime
        };
    }

    /**
     * Pretrain the neural network to be interested in objects
     * Generates positive training examples for moving toward objects
     */
    public pretrainObjectInterest(canvasWidth: number, canvasHeight: number, 
                                 objects: Array<{position: Position, getSize?: () => number}>): void {
        console.log('🎯 Pretraining neural network to be interested in objects...');
        
        const pretrainingExamples: TrainingExample[] = [];
        const numExamples = 500; // Generate 50 pretraining examples
        
        for (let i = 0; i < numExamples; i++) {
            // Random agent position (avoiding edges)
            const agentX = 50 + Math.random() * (canvasWidth - 100);
            const agentY = 50 + Math.random() * (canvasHeight - 100);
            
            // Random velocity
            const velX = (Math.random() - 0.5) * 10;
            const velY = (Math.random() - 0.5) * 10;
            
            // Calculate state features for this position
            const state = this.calculateStateForPosition(agentX, agentY, velX, velY, canvasWidth, canvasHeight, objects);
            
            // Find nearest object
            let nearestObj: typeof objects[0] | null = null;
            let minDist = Infinity;
            
            objects.forEach(obj => {
                const dist = Math.sqrt((obj.position.x - agentX) ** 2 + (obj.position.y - agentY) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    nearestObj = obj;
                }
            });
            
            if (nearestObj) {
                // Calculate movement toward nearest object
                const objPos = (nearestObj as any).position;
                const toObjectX = objPos.x - agentX;
                const toObjectY = objPos.y - agentY;
                const distance = Math.sqrt(toObjectX ** 2 + toObjectY ** 2);
                
                // Normalize and scale the movement
                const moveStrength = 8; // Moderate movement speed
                const actionX = (toObjectX / distance) * moveStrength;
                const actionY = (toObjectY / distance) * moveStrength;
                
                // Create positive training example
                const example: TrainingExample = {
                    state: state,
                    action: [actionX, actionY],
                    reward: 1.0,
                    timestamp: Date.now() + i // Slightly different timestamps
                };
                
                pretrainingExamples.push(example);
            }
        }
        
        // Add pretraining examples to training data
        this.trainingData.push(...pretrainingExamples);
        console.log(`✅ Added ${pretrainingExamples.length} pretraining examples encouraging object interest`);
        console.log(`Total training data: ${this.trainingData.length} examples`);
        
        // Train the model immediately with the pretraining data
        this.trainModel();
    }

    /**
     * Calculate state features for a given position (used for pretraining)
     */
    private calculateStateForPosition(x: number, y: number, velX: number, velY: number,
                                    canvasWidth: number, canvasHeight: number,
                                    objects: Array<{position: Position, getSize?: () => number}>): number[] {
        const state: number[] = [];
        
        // Agent position and velocity (normalized)
        state.push(x / canvasWidth);
        state.push(y / canvasHeight);
        state.push(velX / 20); // Normalize velocity
        state.push(velY / 20);
        
        // Object distances and relative positions
        objects.forEach(obj => {
            const dx = obj.position.x - x;
            const dy = obj.position.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight);
            
            state.push(distance / maxDistance); // Normalized distance
            state.push(dx / canvasWidth); // Relative X position
            state.push(dy / canvasHeight); // Relative Y position
            
            // Approach calculation (dot product of velocity and direction to object)
            const velMagnitude = Math.sqrt(velX * velX + velY * velY);
            const approach = velMagnitude > 0 ? ((velX * dx + velY * dy) / (velMagnitude * distance)) : 0;
            state.push(approach);
        });
        
        // Wall proximity and center direction
        const nearestWallDist = Math.min(x, y, canvasWidth - x, canvasHeight - y);
        state.push(nearestWallDist / Math.min(canvasWidth, canvasHeight));
        
        const toCenterX = (canvasWidth / 2) - x;
        const toCenterY = (canvasHeight / 2) - y;
        const centerDistance = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
        state.push(centerDistance > 0 ? toCenterX / centerDistance : 0);
        state.push(centerDistance > 0 ? toCenterY / centerDistance : 0);
        
        return state;
    }

    public generateRandomMovement(): {dx: number, dy: number} {
        // Much more dynamic random movement with higher speed variations
        const baseSpeed = 10; // Increased from 5 to 10
        const speedVariation = 8; // Increased from 4 to 8
        const angle = Math.random() * Math.PI * 2;
        const speed = baseSpeed + (Math.random() - 0.5) * speedVariation;
        
        return {
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed
        };
    }
}
