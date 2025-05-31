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

        // Compile the model with a conservative optimizer
        this.model.compile({
            optimizer: (window as any).tf.train.adam(0.001), // Reduced learning rate from 0.003 to 0.001
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
     * Predict the next movement direction using object-focused neural network
     */
    public async predict(state: number[]): Promise<{dx: number, dy: number}> {
        const inputTensor = (window as any).tf.tensor2d([state], [1, 19]);
        const prediction = this.model.predict(inputTensor) as any;
        const output = await prediction.data();
        
        // Clean up tensors
        inputTensor.dispose();
        prediction.dispose();

        // OBJECT-FOCUSED MOVEMENT LOGIC
        // Get object distances and directions
        const circleDistance = state[4];
        const circleDirX = state[5];
        const circleDirY = state[6];
        
        const squareDistance = state[8];
        const squareDirX = state[9];
        const squareDirY = state[10];
        
        const diamondDistance = state[12];
        const diamondDirX = state[13];
        const diamondDirY = state[14];
        
        // Find the nearest object
        const objects = [
            { distance: circleDistance, dirX: circleDirX, dirY: circleDirY },
            { distance: squareDistance, dirX: squareDirX, dirY: squareDirY },
            { distance: diamondDistance, dirX: diamondDirX, dirY: diamondDirY }
        ];
        
        const nearestObject = objects.reduce((nearest, current) => 
            current.distance < nearest.distance ? current : nearest
        );
        
        // STRONG OBJECT ATTRACTION - Override neural network when far from objects
        let finalDx = output[0];
        let finalDy = output[1];
        
        const objectAttractionStrength = 0.6; // Strong attraction to nearest object
        const baseMovementScale = 1.5;
        
        // If we're far from all objects, move toward the nearest one
        if (nearestObject.distance > 0.4) {
            // Override neural network with object-seeking behavior
            finalDx = finalDx * 0.3 + nearestObject.dirX * objectAttractionStrength;
            finalDy = finalDy * 0.3 + nearestObject.dirY * objectAttractionStrength;
            console.log('🎯 Seeking nearest object');
        } else {
            // Close to objects, let neural network decide with gentle object bias
            finalDx = finalDx + nearestObject.dirX * 0.2;
            finalDy = finalDy + nearestObject.dirY * 0.2;
        }
        
        // Apply base scaling
        finalDx *= baseMovementScale;
        finalDy *= baseMovementScale;
        
        // WALL AVOIDANCE (secondary concern)
        const wallDist = state[16];
        if (wallDist < 0.2) {
            const centerX = state[17];
            const centerY = state[18];
            const wallAvoidanceStrength = (0.2 - wallDist) / 0.2;
            
            finalDx += centerX * wallAvoidanceStrength * 0.5;
            finalDy += centerY * wallAvoidanceStrength * 0.5;
        }
        
        return {
            dx: Math.max(-2.5, Math.min(2.5, finalDx)),
            dy: Math.max(-2.5, Math.min(2.5, finalDy))
        };
    }

    /**
     * Record a positive training example when the user rewards the agent
     * Focus on object proximity rather than wall avoidance
     */
    public recordReward(state: number[], action: number[]): void {
        // Get object distances
        const circleDistance = state[4];
        const squareDistance = state[8];
        const diamondDistance = state[12];
        const nearestObjectDist = Math.min(circleDistance, squareDistance, diamondDistance);
        
        // REWARD BASED ON OBJECT PROXIMITY (not wall distance)
        let adjustedReward = 1.0;
        
        // Increase reward when close to objects!
        if (nearestObjectDist < 0.3) {
            adjustedReward = 2.0; // Double reward for being near objects
            console.log(`🎯 BONUS reward for object proximity! Distance: ${(nearestObjectDist * 100).toFixed(1)}%`);
        } else if (nearestObjectDist < 0.5) {
            adjustedReward = 1.5; // 50% bonus for moderate object proximity
            console.log(`🎯 Bonus reward for object proximity! Distance: ${(nearestObjectDist * 100).toFixed(1)}%`);
        }
        
        // Only reduce reward if agent is both far from objects AND near walls
        const wallDistance = state[16];
        if (nearestObjectDist > 0.7 && wallDistance < 0.2) {
            adjustedReward = 0.5; // Reduce reward only when ignoring objects AND near walls
            console.log(`⚠️ Reduced reward: far from objects (${(nearestObjectDist * 100).toFixed(1)}%) and near walls`);
        }

        const example: TrainingExample = {
            state: [...state],
            action: [...action],
            reward: adjustedReward,
            timestamp: Date.now()
        };

        this.trainingData.push(example);
        
        // Add strong object-seeking examples
        if (nearestObjectDist > 0.4) {
            // Create examples that move toward the nearest object
            const objects = [
                { distance: circleDistance, dirX: state[5], dirY: state[6] },
                { distance: squareDistance, dirX: state[9], dirY: state[10] },
                { distance: diamondDistance, dirX: state[13], dirY: state[14] }
            ];
            
            const nearestObject = objects.reduce((nearest, current) => 
                current.distance < nearest.distance ? current : nearest
            );
            
            // Create an action that moves toward the nearest object
            const objectSeekingAction = [nearestObject.dirX * 2.0, nearestObject.dirY * 2.0];
            
            const objectExample: TrainingExample = {
                state: [...state],
                action: objectSeekingAction,
                reward: 2.5, // Very high reward for object-seeking behavior
                timestamp: Date.now()
            };
            
            this.trainingData.push(objectExample);
            console.log(`🎯 Added object-seeking example (toward nearest object)`);
        }

        console.log(`Reward recorded! Training data size: ${this.trainingData.length}`);
        console.log('Adjusted reward:', adjustedReward);
        console.log('Nearest object distance:', (nearestObjectDist * 100).toFixed(1) + '%');

        // Limit training data size
        if (this.trainingData.length > 1000) {
            this.trainingData = this.trainingData.slice(-500);
        }
    }

    /**
     * Clear training data that encourages wall-seeking behavior
     * This helps reset the agent when it develops bad habits
     */
    public clearWallSeekingData(): void {
        const originalSize = this.trainingData.length;
        
        // Remove training examples where the agent was very close to walls
        this.trainingData = this.trainingData.filter(example => {
            const wallDistance = example.state[16]; // Normalized wall distance
            return wallDistance > 0.25; // Keep only examples where agent was reasonably far from walls
        });
        
        const removedCount = originalSize - this.trainingData.length;
        console.log(`🧹 Cleared ${removedCount} wall-seeking training examples. Remaining: ${this.trainingData.length}`);
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
        const numExamples = 200; // Reduced to a reasonable number for quality over quantity
        
        for (let i = 0; i < numExamples; i++) {
            // Random agent position (favoring center area, not edges)
            const marginPercent = 0.25; // Keep agent in center 50% of canvas
            const centerMarginX = canvasWidth * marginPercent;
            const centerMarginY = canvasHeight * marginPercent;
            
            const agentX = centerMarginX + Math.random() * (canvasWidth - 2 * centerMarginX);
            const agentY = centerMarginY + Math.random() * (canvasHeight - 2 * centerMarginY);
            
            // Zero or small random velocity
            const velX = (Math.random() - 0.5) * 2; // Smaller velocity range
            const velY = (Math.random() - 0.5) * 2;
            
            // Calculate state for this position
            const state = this.calculateState(
                { x: agentX, y: agentY },
                canvasWidth,
                canvasHeight,
                objects,
                { dx: velX, dy: velY }
            );
            
            // Find nearest object and create action toward it
            const circleDistance = state[4];
            const squareDistance = state[8];
            const diamondDistance = state[12];
            
            const objectInfo = [
                { distance: circleDistance, dirX: state[5], dirY: state[6] },
                { distance: squareDistance, dirX: state[9], dirY: state[10] },
                { distance: diamondDistance, dirX: state[13], dirY: state[14] }
            ];
            
            const nearestObject = objectInfo.reduce((nearest, current) => 
                current.distance < nearest.distance ? current : nearest
            );
            
            // Create action that moves toward nearest object
            const objectSeekingAction = [
                nearestObject.dirX * 1.5, // Move toward object
                nearestObject.dirY * 1.5
            ];
            
            // Higher reward for being closer to objects
            const proximityReward = 2.0 - nearestObject.distance; // Closer = higher reward
            
            const example: TrainingExample = {
                state: [...state],
                action: objectSeekingAction,
                reward: Math.max(1.0, proximityReward), // At least 1.0 reward
                timestamp: Date.now() - i // Vary timestamps
            };
            
            pretrainingExamples.push(example);
        }
        
        // Add all pretraining examples to training data
        this.trainingData = [...pretrainingExamples, ...this.trainingData];
        
        console.log(`✅ Added ${numExamples} object-focused pretraining examples`);
        console.log(`📊 Total training data: ${this.trainingData.length} examples`);
        
        // Train immediately on this data
        this.trainModel();
    }
}
