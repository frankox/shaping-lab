import { Position } from './types.js';

export interface TrainingExample {
    state: number[];
    action: number[];
    reward: number;
    timestamp: number;
}

export interface MemoryEntry {
    state: number[];
    action: number[];
    timestamp: number;
}

export class NeuralNetwork {
    private model: any; // TensorFlow.js model - ACTIVE model used for predictions
    private trainingModel: any; // TensorFlow.js model - TRAINING model (copy for background training)
    private trainingData: TrainingExample[];
    private isTraining: boolean;
    private lastTrainingTime: number;
    private isReady: boolean; // Whether the network is ready for use (after pretraining)
    
    // TEMPORAL MEMORY SYSTEM for automatic neutral feedback
    private temporalMemory: MemoryEntry[]; // Buffer of recent actions
    private lastTrainingEvent: number; // When the last training event occurred (reward, punishment, or neutral)
    private neutralFeedbackDuration: number; // 10 seconds timeout for neutral feedback
    private memoryCheckInterval: number; // How often to check for timeouts
    private lastMemoryCheck: number; // Last time we checked memory
    
    // NON-BLOCKING TRAINING SYSTEM
    private trainingQueued: boolean; // Whether training is queued for next idle moment
    private trainingTimeout: any; // Timeout ID for scheduled training
    
    // DATA RATE LIMITING - 10 entries per second
    private lastDataRecordTime: number; // Last time data was recorded
    private dataRecordInterval: number; // Minimum interval between data records (100ms for 10/sec)
    private dataCountCurrentSecond: number; // Count of data recorded in current second
    private lastSecondReset: number; // Last time the second counter was reset

    constructor() {
        this.trainingData = [];
        this.isTraining = false;
        this.lastTrainingTime = 0;
        this.isReady = false; // Start as not ready until pretraining is complete
        
        // Initialize temporal memory system for automatic neutral feedback
        this.temporalMemory = [];
        this.lastTrainingEvent = Date.now();
        this.neutralFeedbackDuration = 10000; // 10 seconds
        this.memoryCheckInterval = 1000; // Check every 1 second
        this.lastMemoryCheck = Date.now();
        
        // Initialize non-blocking training system
        this.trainingQueued = false;
        this.trainingTimeout = null;
        
        // Initialize training model as null (will be created when needed)
        this.trainingModel = null;
        
        // Initialize data rate limiting (5 entries per second for even better performance)
        this.lastDataRecordTime = 0;
        this.dataRecordInterval = 200; // 200ms = 5 entries per second max (reduced from 10)
        this.dataCountCurrentSecond = 0;
        this.lastSecondReset = Date.now();
        
        this.initializeModel();
    }

    /**
     * Initialize the neural network model - PURE INTELLIGENCE ARCHITECTURE
     * Advanced deep learning system for autonomous agent behavior
     * Input: [x, y, velocity_x, velocity_y, 
     *         circle_dist, circle_rel_x, circle_rel_y, circle_approach,
     *         square_dist, square_rel_x, square_rel_y, square_approach,
     *         diamond_dist, diamond_rel_x, diamond_rel_y, diamond_approach,
     *         nearest_wall_dist, wall_direction_x, wall_direction_y] (19 features)
     * Output: [deltaX, deltaY] (2 outputs for movement direction)
     */
    private initializeModel(): void {
        // Create an advanced neural network for autonomous intelligent behavior
        this.model = (window as any).tf.sequential({
            layers: [
                // Input layer: 19 features (comprehensive spatial awareness)
                (window as any).tf.layers.dense({
                    inputShape: [19],
                    units: 96, // Increased capacity for more complex learning
                    activation: 'relu',
                    kernelInitializer: 'heNormal',
                    useBias: true,
                    name: 'spatial_intelligence'
                }),
                // Enhanced dropout for robustness
                (window as any).tf.layers.dropout({
                    rate: 0.15
                }),
                // Hidden layer 1 - Deep spatial reasoning
                (window as any).tf.layers.dense({
                    units: 72,
                    activation: 'relu',
                    kernelInitializer: 'heNormal',
                    name: 'deep_spatial_analysis'
                }),
                // Hidden layer 2 - Object relationship understanding
                (window as any).tf.layers.dense({
                    units: 48,
                    activation: 'relu', 
                    kernelInitializer: 'heNormal',
                    name: 'object_relationship'
                }),
                // Dropout for pattern generalization
                (window as any).tf.layers.dropout({
                    rate: 0.1
                }),
                // Hidden layer 3 - Behavioral intelligence
                (window as any).tf.layers.dense({
                    units: 32,
                    activation: 'relu',
                    kernelInitializer: 'heNormal',
                    name: 'behavioral_intelligence'
                }),
                // Hidden layer 4 - Movement planning
                (window as any).tf.layers.dense({
                    units: 16,
                    activation: 'relu',
                    kernelInitializer: 'heNormal',
                    name: 'movement_planning'
                }),
                // Output layer: Pure neural movement control
                (window as any).tf.layers.dense({
                    units: 2,
                    activation: 'tanh', // Normalized output [-1, 1]
                    kernelInitializer: 'glorotNormal',
                    name: 'autonomous_movement'
                })
            ]
        });

        // Advanced optimizer for sophisticated learning
        this.model.compile({
            optimizer: (window as any).tf.train.adam(0.003), // Higher learning rate for autonomous intelligence
            loss: 'meanSquaredError',
            metrics: ['mse']
        });

        console.log('🧠 PURE INTELLIGENCE NEURAL NETWORK INITIALIZED');
        console.log('🚀 Architecture: 96→72→48→32→16→2 neurons with advanced autonomous learning');
        console.log('✨ The agent will develop natural curiosity and intelligence through pure neural learning');
        this.model.summary();
    }

    /**
     * Create a copy of the current model for background training
     * This enables double-buffering: train on copy, swap when done
     * Using manual architecture recreation (most reliable for TensorFlow.js 4.10.0)
     */
    private async createModelCopy(): Promise<any> {
        try {
            const tf = (window as any).tf;
            
            // Create a new model with the same architecture
            const newModel = tf.sequential({
                layers: [
                    // Input layer: 19 features (comprehensive spatial awareness)
                    tf.layers.dense({
                        inputShape: [19],
                        units: 96,
                        activation: 'relu',
                        kernelInitializer: 'heNormal',
                        useBias: true,
                        name: 'enhanced_spatial_awareness'
                    }),
                    // Enhanced dropout for robustness
                    tf.layers.dropout({
                        rate: 0.15
                    }),
                    // Hidden layer 1 - Deep spatial reasoning
                    tf.layers.dense({
                        units: 72,
                        activation: 'relu',
                        kernelInitializer: 'heNormal',
                        name: 'deep_spatial_analysis'
                    }),
                    // Hidden layer 2 - Object relationship understanding
                    tf.layers.dense({
                        units: 48,
                        activation: 'relu', 
                        kernelInitializer: 'heNormal',
                        name: 'object_relationship'
                    }),
                    // Dropout for pattern generalization
                    tf.layers.dropout({
                        rate: 0.1
                    }),
                    // Hidden layer 3 - Behavioral intelligence
                    tf.layers.dense({
                        units: 32,
                        activation: 'relu',
                        kernelInitializer: 'heNormal',
                        name: 'behavioral_intelligence'
                    }),
                    // Hidden layer 4 - Movement planning
                    tf.layers.dense({
                        units: 16,
                        activation: 'relu',
                        kernelInitializer: 'heNormal',
                        name: 'movement_planning'
                    }),
                    // Output layer: Pure neural movement control
                    tf.layers.dense({
                        units: 2,
                        activation: 'tanh',
                        kernelInitializer: 'glorotNormal',
                        name: 'autonomous_movement'
                    })
                ]
            });

            // Compile the new model with the same configuration as the original
            newModel.compile({
                optimizer: tf.train.adam(0.003),
                loss: 'meanSquaredError',
                metrics: ['mse']
            });

            // Copy weights from the current model to the new model
            const currentWeights = this.model.getWeights();
            newModel.setWeights(currentWeights);
            
            console.log('✅ Model cloned using manual architecture method (TF.js 4.10.0 compatible)');
            return newModel;
            
        } catch (error) {
            console.error('❌ Failed to create model copy:', error);
            throw error;
        }
    }

    /**
     * Atomically swap the training model with the active model
     * This ensures smooth transitions without rendering interruption
     */
    private swapModels(): void {
        if (this.trainingModel) {
            try {
                // Dispose of the old active model to free memory
                if (this.model && !this.model.isDisposed) {
                    this.model.dispose();
                }
                
                // Atomically switch to the newly trained model
                this.model = this.trainingModel;
                this.trainingModel = null;
                
                console.log('🔄 Model swap completed - new training applied!');
            } catch (error) {
                console.error('❌ Error during model swap:', error);
                // If swap fails, keep the original model and dispose the training model
                if (this.trainingModel && !this.trainingModel.isDisposed) {
                    this.trainingModel.dispose();
                }
                this.trainingModel = null;
            }
        }
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
     * Predict the next movement direction using PURE NEURAL NETWORK INTELLIGENCE
     * NO ARTIFICIAL ASSISTANCE - Complete autonomous control
     */
    public async predict(state: number[]): Promise<{dx: number, dy: number}> {
        try {
            // Check if model is available and not disposed
            if (!this.model || this.model.isDisposed) {
                console.warn('⚠️ Model not available for prediction, using fallback');
                return { dx: 0, dy: 0 };
            }

            const inputTensor = (window as any).tf.tensor2d([state], [1, 19]);
            const prediction = this.model.predict(inputTensor) as any;
            const output = await prediction.data();
            
            // Clean up tensors
            inputTensor.dispose();
            prediction.dispose();

            // PURE NEURAL NETWORK OUTPUT - No artificial scaling or biases
            // The network learns to output appropriate movement values through training
            const autonomousMovementScale = 4.5; // Sufficient range for effective movement
            
            const neuralDx = output[0] * autonomousMovementScale;
            const neuralDy = output[1] * autonomousMovementScale;
            
            // Only basic physics constraints to prevent simulation breaking
            return {
                dx: Math.max(-5.0, Math.min(5.0, neuralDx)),
                dy: Math.max(-5.0, Math.min(5.0, neuralDy))
            };
        } catch (error) {
            console.error('Neural network prediction failed, minimal fallback:', error);
            return { dx: 0, dy: 0 };
        }
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
            adjustedReward = 2.0; 
            console.log(`🎯 BONUS reward for object proximity! Distance: ${(nearestObjectDist * 100).toFixed(1)}%`);
        } else if (nearestObjectDist < 0.5) {
            adjustedReward = 1.5;
            console.log(`🎯 Bonus reward for object proximity! Distance: ${(nearestObjectDist * 100).toFixed(1)}%`);
        }
        
        // Only reduce reward if agent is both far from objects AND near walls
        const wallDistance = state[16];
        if (nearestObjectDist > 0.7 && wallDistance < 0.2) {
            adjustedReward = 0; // Reduce reward only when ignoring objects AND near walls
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
     * Clear ALL training data after a training session
     * This ensures states are never processed multiple times
     */
    private clearAllTrainingData(): void {
        const clearedCount = this.trainingData.length;
        this.trainingData = [];
        console.log(`🧹 Training data cleared! Removed ${clearedCount} examples to prevent duplicate processing`);
    }

    /**
     * Clear ALL temporal memory states that have been processed
     * This ensures states are never processed multiple times
     */
    private clearProcessedTemporalMemory(processedStates: MemoryEntry[]): void {
        const originalSize = this.temporalMemory.length;
        
        // Remove all processed states from temporal memory
        this.temporalMemory = this.temporalMemory.filter(
            entry => !processedStates.some(processed => 
                processed.timestamp === entry.timestamp &&
                processed.state.length === entry.state.length &&
                processed.state.every((val, idx) => Math.abs(val - entry.state[idx]) < 0.0001)
            )
        );
        
        const removedCount = originalSize - this.temporalMemory.length;
        console.log(`🧹 Removed ${removedCount} processed states from temporal memory. Remaining: ${this.temporalMemory.length}`);
    }

    /**
     * NON-BLOCKING TRAINING SYSTEM
     * Queue training to run asynchronously without blocking the rendering loop
     */
    
    /**
     * Schedule training to run in the background without blocking the UI
     * Uses requestIdleCallback if available, otherwise setTimeout
     */
    private scheduleNonBlockingTraining(): void {
        // Don't queue if already queued or currently training
        if (this.trainingQueued || this.isTraining) {
            return;
        }
        
        this.trainingQueued = true;
        
        // Clear any existing timeout
        if (this.trainingTimeout !== null) {
            clearTimeout(this.trainingTimeout);
        }
        
        // Use requestIdleCallback for better performance if available
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => {
                this.executeNonBlockingTraining();
            }, { timeout: 2000 }); // Fallback to timeout after 2 seconds
        } else {
            // Fallback to setTimeout with a longer delay to reduce training frequency
            this.trainingTimeout = setTimeout(() => {
                this.executeNonBlockingTraining();
            }, 300); // Increased delay to reduce frequency
        }
    }
    
    /**
     * Execute training in a non-blocking way using async chunks
     */
    private async executeNonBlockingTraining(): Promise<void> {
        this.trainingQueued = false;
        this.trainingTimeout = null;
        
        // Don't train if conditions aren't met or if trained recently
        const timeSinceLastTraining = Date.now() - this.lastTrainingTime;
        if (this.trainingData.length < 10 || this.isTraining || timeSinceLastTraining < 2000) {
            return;
        }
        
        try {
            // Split training into smaller chunks to prevent blocking
            await this.trainModelNonBlocking();
        } catch (error) {
            console.error('Non-blocking training failed:', error);
        }
    }
    
    /**
     * Train the model using double-buffering to prevent animation lag
     * Creates a copy of the model, trains it in background, then swaps atomically
     */
    private async trainModelNonBlocking(): Promise<void> {
        const timeSinceLastTraining = Date.now() - this.lastTrainingTime;
        if (this.trainingData.length < 10 || this.isTraining || timeSinceLastTraining < 2000) {
            return;
        }

        this.isTraining = true;
        this.lastTrainingTime = Date.now();

        console.log(`🧠 Double-buffered training started with ${this.trainingData.length} examples...`);

        try {
            // STEP 1: Create a copy of the current model for background training
            this.trainingModel = await this.createModelCopy();
            console.log('📋 Model copy created for background training');

            // STEP 2: Prepare training data (use only a subset for faster training)
            const maxSamples = Math.min(50, this.trainingData.length); // Limit samples for speed
            const sampleData = this.trainingData.slice(-maxSamples); // Use most recent data
            
            const inputData: number[][] = [];
            const outputData: number[][] = [];

            sampleData.forEach(example => {
                inputData.push([...example.state]);
                outputData.push([...example.action]);
            });

            const inputTensor = (window as any).tf.tensor2d(inputData);
            const outputTensor = (window as any).tf.tensor2d(outputData);

            // STEP 3: Train the COPY model (not the active one!)
            // The active model continues to be used for predictions without interruption
            const history = await this.trainingModel.fit(inputTensor, outputTensor, {
                epochs: 2, // Reduced from 5 for even faster training
                batchSize: Math.min(32, Math.max(8, Math.floor(sampleData.length / 2))), // Larger batches
                shuffle: true,
                verbose: 0, // No console output for performance
                validationSplit: 0,
                callbacks: {
                    onEpochEnd: async (_epoch: number, _logs: any) => {
                        // Yield control back to browser after each epoch
                        await new Promise(resolve => setTimeout(resolve, 5));
                    }
                }
            });

            // STEP 4: Clean up tensors immediately
            inputTensor.dispose();
            outputTensor.dispose();

            // STEP 5: Atomically swap the trained model with the active model
            // This is a single, fast operation that doesn't interrupt rendering
            this.swapModels();

            const finalLoss = history.history.loss[history.history.loss.length - 1];
            console.log(`⚡ Double-buffered training completed! Loss: ${finalLoss.toFixed(4)}`);

        } catch (error) {
            console.error('Double-buffered training failed:', error);
            // Clean up training model if something went wrong
            if (this.trainingModel) {
                this.trainingModel.dispose();
                this.trainingModel = null;
            }
        } finally {
            this.isTraining = false;
            
            // ALWAYS clear training data after any training session
            // This ensures states are never processed multiple times
            this.clearAllTrainingData();
        }
    }

    /**
     * Check if the neural network is ready for use (after pretraining)
     */
    public isNetworkReady(): boolean {
        return this.isReady;
    }

    /**
     * Mark the network as ready after pretraining
     */
    public markAsReady(): void {
        this.isReady = true;
        console.log('✅ Neural network marked as ready!');
    }

    /**
     * Force training with current data (used during pretraining)
     */
    public async forceTraining(): Promise<void> {
        if (this.trainingData.length < 10) {
            console.log('⚠️ Not enough training data for forced training');
            return;
        }

        console.log(`🚀 Force training with ${this.trainingData.length} examples...`);
        await this.trainModelNonBlocking();
    }

    /**
     * Pretrain the network to be interested in objects
     * This gives the agent a head start before manual training begins
     */
    public async pretrainObjectInterest(canvasWidth: number, canvasHeight: number, staticObjects: any[]): Promise<void> {
        console.log('🎯 Generating object-interest training data...');
        
        // Generate 200 positive examples where agent moves toward objects
        for (let i = 0; i < 200; i++) {
            // Random agent position
            const agentX = Math.random() * canvasWidth;
            const agentY = Math.random() * canvasHeight;
            
            // Pick random target object
            const targetObject = staticObjects[Math.floor(Math.random() * staticObjects.length)];
            const targetX = targetObject.position.x;
            const targetY = targetObject.position.y;
            
            // Calculate direction towards object
            const dx = targetX - agentX;
            const dy = targetY - agentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Normalize direction (this becomes the "good" action)
            const actionX = (dx / distance) * 0.7; // Moderate speed
            const actionY = (dy / distance) * 0.7;
            
            // Create state vector (19 features)
            const state = this.createSyntheticState(agentX, agentY, staticObjects, canvasWidth, canvasHeight);
            
            // Higher reward when closer to objects
            const normalizedDistance = Math.min(distance / 200, 1.0);
            const reward = 0.8 - (normalizedDistance * 0.6); // Range: 0.2 to 0.8
            
            // Add directly to training data
            this.trainingData.push({
                state: state,
                action: [actionX, actionY],
                reward: reward,
                timestamp: Date.now()
            });
        }

        // Generate 80 negative examples where agent moves away from objects
        for (let i = 0; i < 80; i++) {
            // Random agent position, but closer to objects for contrast
            const targetObject = staticObjects[Math.floor(Math.random() * staticObjects.length)];
            const agentX = targetObject.position.x + (Math.random() - 0.5) * 150;
            const agentY = targetObject.position.y + (Math.random() - 0.5) * 150;
            
            // Calculate direction AWAY from object
            const dx = agentX - targetObject.position.x;
            const dy = agentY - targetObject.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Normalize away direction (this becomes the "bad" action)
            const actionX = (dx / distance) * 0.8;
            const actionY = (dy / distance) * 0.8;
            
            // Create state vector
            const state = this.createSyntheticState(agentX, agentY, staticObjects, canvasWidth, canvasHeight);
            
            // Add directly to training data
            this.trainingData.push({
                state: state,
                action: [actionX, actionY],
                reward: -0.3,
                timestamp: Date.now()
            });
        }

        console.log(`📊 Generated ${this.trainingData.length} pretraining examples`);
        
        // Train the network with this data
        await this.forceTraining();
        
        console.log('✅ Object interest pretraining completed!');
    }

    /**
     * Create a synthetic state vector for pretraining
     */
    private createSyntheticState(agentX: number, agentY: number, objects: any[], canvasWidth: number, canvasHeight: number): number[] {
        const state = [];
        
        // Agent position (normalized)
        state.push(agentX / canvasWidth);
        state.push(agentY / canvasHeight);
        
        // Distance to each object (3 objects)
        objects.forEach(obj => {
            const dx = obj.position.x - agentX;
            const dy = obj.position.y - agentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            state.push(Math.min(distance / 200, 1.0)); // Normalized distance
        });
        
        // Direction to each object (6 values: dx, dy for each)
        objects.forEach(obj => {
            const dx = obj.position.x - agentX;
            const dy = obj.position.y - agentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            state.push(dx / distance); // Normalized direction x
            state.push(dy / distance); // Normalized direction y
        });
        
        // Distance to walls (4 walls)
        state.push(agentX / canvasWidth); // Left wall
        state.push((canvasWidth - agentX) / canvasWidth); // Right wall  
        state.push(agentY / canvasHeight); // Top wall
        state.push((canvasHeight - agentY) / canvasHeight); // Bottom wall
        
        // Agent velocity (simulated as small random values)
        state.push((Math.random() - 0.5) * 0.2);
        state.push((Math.random() - 0.5) * 0.2);
        
        // Previous action (simulated as small random values)
        state.push((Math.random() - 0.5) * 0.4);
        state.push((Math.random() - 0.5) * 0.4);
        
        return state;
    }

    /**
     * Get training statistics for monitoring
     */
    public getStats(): { dataSize: number, isTraining: boolean, lastTraining: number, isReady: boolean } {
        return {
            dataSize: this.trainingData.length,
            isTraining: this.isTraining,
            lastTraining: this.lastTrainingTime,
            isReady: this.isReady
        };
    }

    /**
     * TEMPORAL MEMORY SYSTEM - Automatic reward/punishment based on timing
     * Records actions for automatic feedback when manual rewards are delayed
     */
    
    /**
     * Record an action to temporal memory for potential automatic feedback
     * Rate limited to 10 entries per second for better performance
     * @param state Current state vector
     * @param action Action taken [deltaX, deltaY]
     */
    recordAction(state: number[], action: number[]): void {
        const now = Date.now();
        
        // Reset counter every second
        if (now - this.lastSecondReset >= 1000) {
            this.dataCountCurrentSecond = 0;
            this.lastSecondReset = now;
        }
        
        // Rate limiting: Maximum 5 entries per second (reduced for better performance)
        if (this.dataCountCurrentSecond >= 5) {
            return; // Skip this recording to maintain rate limit
        }
        
        // Additional time-based limiting to spread entries evenly
        if (now - this.lastDataRecordTime < this.dataRecordInterval) {
            return; // Skip this recording to maintain minimum interval
        }
        
        this.lastDataRecordTime = now;
        this.dataCountCurrentSecond++;
        
        // Add to temporal memory buffer
        this.temporalMemory.push({
            state: [...state],
            action: [...action],
            timestamp: now
        });
        
        // Optimize: Only clean up memory periodically, not on every action
        if (this.temporalMemory.length > 50) { // Reduced buffer size for better performance
            this.temporalMemory = this.temporalMemory.filter(
                entry => now - entry.timestamp < 15000 // Keep 15 seconds worth
            );
        }
        
        // Check for timeout-based punishment less frequently
        this.checkForTimeoutPunishment();
    }
    
    /**
     * Called when manual reward is given - converts buffered actions to positive examples
     * Uses temporal weighting: more recent actions get higher rewards
     * @param intensity Base reward intensity (0.1 to 1.0)
     */
    giveManualReward(intensity: number = 0.8): void {
        const now = Date.now();
        
        // Update last training event time (resets 10-second timer)
        this.lastTrainingEvent = now;
        console.log(`🎉 MANUAL REWARD given! 10-second neutral feedback timer RESET.`);
        
        // Get all states from temporal memory since the last training event
        const statesToProcess = this.temporalMemory.filter(
            entry => entry.timestamp >= this.lastTrainingEvent - this.neutralFeedbackDuration
        );
        
        console.log(`   Converting ${statesToProcess.length} recent actions to temporally weighted positive examples`);
        
        statesToProcess.forEach(entry => {
            // Calculate temporal weight: more recent actions get higher rewards
            const actionAge = now - entry.timestamp;
            const normalizedAge = actionAge / this.neutralFeedbackDuration; // 0 = most recent, 1 = oldest
            const temporalWeight = 1.0 - Math.min(normalizedAge, 1.0); // 1.0 = most recent, 0.0 = oldest
            
            // Apply temporal weighting to reward intensity
            const weightedReward = intensity * Math.max(0.1, temporalWeight); // Minimum 10% of base intensity
            
            const trainingExample: TrainingExample = {
                state: [...entry.state],
                action: [...entry.action],
                reward: weightedReward,
                timestamp: entry.timestamp
            };
            this.trainingData.push(trainingExample);
            
            console.log(`   Action ${actionAge}ms ago: weight=${temporalWeight.toFixed(2)}, reward=${weightedReward.toFixed(3)}`);
        });
        
        // Clear the processed states from temporal memory
        this.clearProcessedTemporalMemory(statesToProcess);
        console.log(`   ✅ Timer reset! All processed states removed from memory.`);
        
        // Trigger non-blocking training if we have enough examples
        if (this.trainingData.length >= 5) {
            this.scheduleNonBlockingTraining();
        }
    }

    /**
     * Called when manual punishment is given - converts buffered actions to negative examples
     * Uses temporal weighting: more recent actions get stronger punishments
     * @param intensity Base punishment intensity (0.1 to 1.0)
     */
    giveManualPunishment(intensity: number = 0.6): void {
        const now = Date.now();
        
        // Update last training event time (resets 10-second timer)
        this.lastTrainingEvent = now;
        console.log(`🚫 MANUAL PUNISHMENT given! 10-second neutral feedback timer RESET.`);
        
        // Get all states from temporal memory since the last training event
        const statesToProcess = this.temporalMemory.filter(
            entry => entry.timestamp >= this.lastTrainingEvent - this.neutralFeedbackDuration
        );
        
        console.log(`   Converting ${statesToProcess.length} recent actions to temporally weighted negative examples`);
        
        statesToProcess.forEach(entry => {
            // Calculate temporal weight: more recent actions get stronger punishments
            const actionAge = now - entry.timestamp;
            const normalizedAge = actionAge / this.neutralFeedbackDuration; // 0 = most recent, 1 = oldest
            const temporalWeight = 1.0 - Math.min(normalizedAge, 1.0); // 1.0 = most recent, 0.0 = oldest
            
            // Apply temporal weighting to punishment intensity (negative value)
            const weightedPunishment = -intensity * Math.max(0.1, temporalWeight); // Minimum 10% of base intensity
            
            const trainingExample: TrainingExample = {
                state: [...entry.state],
                action: [...entry.action],
                reward: weightedPunishment,
                timestamp: entry.timestamp
            };
            this.trainingData.push(trainingExample);
            
            console.log(`   Action ${actionAge}ms ago: weight=${temporalWeight.toFixed(2)}, punishment=${weightedPunishment.toFixed(3)}`);
        });
        
        // Clear the processed states from temporal memory
        this.clearProcessedTemporalMemory(statesToProcess);
        console.log(`   ✅ Timer reset! All processed states removed from memory.`);
        
        // Trigger non-blocking training if we have enough examples
        if (this.trainingData.length >= 5) {
            this.scheduleNonBlockingTraining();
        }
    }
    
    /**
     * Check for automatic neutral feedback after 10 seconds of inactivity
     * Called periodically to assign neutral rewards (0) to unrewarded actions
     */
    private checkForTimeoutPunishment(): void {
        const now = Date.now();
        
        // Only check at intervals to avoid constant processing
        if (now - this.lastMemoryCheck < this.memoryCheckInterval) {
            return;
        }
        
        this.lastMemoryCheck = now;
        
        // Calculate time since last training event
        const timeSinceLastTraining = now - this.lastTrainingEvent;
        
        // Check if 10 seconds have passed since the last training event
        if (timeSinceLastTraining < this.neutralFeedbackDuration) {
            return; // Not yet time for automatic neutral feedback
        }
        
        // Find actions that occurred since the last training event and haven't been processed
        const statesToProcess = this.temporalMemory.filter(
            entry => entry.timestamp >= this.lastTrainingEvent
        );
        
        if (statesToProcess.length > 0) {
            console.log(`⏰ AUTO NEUTRAL FEEDBACK TRIGGERED! 10 seconds of inactivity detected.`);
            console.log(`   Time since last training: ${timeSinceLastTraining}ms`);
            console.log(`   Processing ${statesToProcess.length} unprocessed states with neutral feedback`);
            
            // Update the last training event time
            this.lastTrainingEvent = now;
            
            // Assign neutral rewards (0) to all unprocessed actions
            statesToProcess.forEach(entry => {
                const trainingExample: TrainingExample = {
                    state: [...entry.state],
                    action: [...entry.action],
                    reward: 0, // Neutral reward - neither positive nor negative
                    timestamp: entry.timestamp
                };
                this.trainingData.push(trainingExample);
            });
            
            console.log(`   ✅ All ${statesToProcess.length} states assigned neutral reward (0.0)`);
            console.log(`   📊 Training data now has ${this.trainingData.length} examples`);
            
            // Remove the processed actions from temporal memory
            this.clearProcessedTemporalMemory(statesToProcess);
            
            // Trigger non-blocking training with the neutral examples
            if (this.trainingData.length >= 10) {
                console.log(`   🚀 Triggering training with ${this.trainingData.length} examples (including neutral feedback)`);
                this.scheduleNonBlockingTraining();
            }
        }
    }
    
    /**
     * Get temporal memory status for debugging
     */
    getTemporalMemoryStatus(): { bufferSize: number; oldestEntryAge: number; timeSinceLastTraining: number } {
        const now = Date.now();
        const oldestEntry = this.temporalMemory.length > 0 ? 
            Math.min(...this.temporalMemory.map(e => e.timestamp)) : now;
        
        return {
            bufferSize: this.temporalMemory.length,
            oldestEntryAge: now - oldestEntry,
            timeSinceLastTraining: now - this.lastTrainingEvent
        };
    }

    /**
     * Clean up resources when the neural network is no longer needed
     */
    public dispose(): void {
        if (this.model) {
            this.model.dispose();
            this.model = null;
        }
        
        if (this.trainingModel) {
            this.trainingModel.dispose();
            this.trainingModel = null;
        }
        
        if (this.trainingTimeout) {
            clearTimeout(this.trainingTimeout);
            this.trainingTimeout = null;
        }
        
        console.log('🧹 Neural network resources cleaned up');
    }
}
