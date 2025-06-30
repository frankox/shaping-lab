import * as tf from '@tensorflow/tfjs';
import { NetworkInput, NetworkOutput, AgentState, Shape } from './types';
import { clamp, distanceToShape } from './utils';

export class NeuralNetworkWrapper {
  private model: tf.Sequential;
  private optimizer: tf.Optimizer;
  private isTraining: boolean = false;
  private learningRate: number = 0.001;
  private cachedPrediction: NetworkOutput | null = null;
  private lastPredictionTime: number = 0;
  private predictionCacheTimeout: number = 50; // Cache for 50ms

  constructor() {
    this.optimizer = tf.train.adam(this.learningRate);
    this.model = this.createModel();
  }

  private createModel(): tf.Sequential {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          inputShape: [7], // 7 input features
          kernelInitializer: 'randomNormal',
        }),
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          kernelInitializer: 'randomNormal',
        }),
        tf.layers.dense({
          units: 8,
          activation: 'relu',
          kernelInitializer: 'randomNormal',
        }),
        tf.layers.dense({
          units: 3,
          activation: 'tanh', // Output range [-1, 1]
          kernelInitializer: 'randomNormal',
        }),
      ],
    });

    model.compile({
      optimizer: this.optimizer,
      loss: 'meanSquaredError',
    });

    return model;
  }

  async predict(input: NetworkInput): Promise<NetworkOutput> {
    const inputTensor = tf.tensor2d([[
      input.posX,
      input.posY,
      input.distToCircle,
      input.distToSquare,
      input.distToTriangle,
      input.heading,
      input.velocity,
    ]]);

    try {
      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const values = await prediction.data();

      // Convert tanh output [-1, 1] to desired ranges
      const rotationDirection = values[0]; // Keep [-1, 1]
      const rotationSpeed = (values[1] + 1) / 2; // Convert to [0, 1]
      const forwardSpeed = (values[2] + 1) / 2; // Convert to [0, 1]

      const result = {
        rotationDirection: clamp(rotationDirection, -1, 1),
        rotationSpeed: clamp(rotationSpeed, 0, 1),
        forwardSpeed: clamp(forwardSpeed, 0, 1),
      };

      // Cache the prediction
      this.cachedPrediction = result;
      this.lastPredictionTime = performance.now();

      return result;
    } finally {
      inputTensor.dispose();
    }
  }

  getCachedPrediction(): NetworkOutput | null {
    // Return cached prediction if it's still valid
    if (this.cachedPrediction && 
        (performance.now() - this.lastPredictionTime) < this.predictionCacheTimeout) {
      return this.cachedPrediction;
    }
    return null;
  }

  async trainOnExperience(
    states: AgentState[],
    rewards: number[],
    shapes: any[],
    canvasWidth: number,
    canvasHeight: number
  ): Promise<void> {
    if (this.isTraining || states.length === 0 || states.length !== rewards.length) {
      return;
    }

    this.isTraining = true;

    try {
      // Convert states to network inputs
      const inputs: number[][] = [];
      const targets: number[][] = [];

      for (let i = 0; i < states.length; i++) {
        const state = states[i];
        const reward = rewards[i];

        // Create network input from state
        const networkInput = this.stateToNetworkInput(state, shapes, canvasWidth, canvasHeight);
        inputs.push([
          networkInput.posX,
          networkInput.posY,
          networkInput.distToCircle,
          networkInput.distToSquare,
          networkInput.distToTriangle,
          networkInput.heading,
          networkInput.velocity,
        ]);

        // Get current prediction for this state
        const currentPrediction = await this.predict(networkInput);
        
        // Adjust the target based on reward
        // This is a simplified approach - in a more sophisticated implementation,
        // we might use temporal difference learning or policy gradients
        const adjustmentFactor = reward * 0.1; // Scale down the adjustment
        
        const target = [
          clamp(currentPrediction.rotationDirection + adjustmentFactor * (Math.random() - 0.5), -1, 1),
          clamp(currentPrediction.rotationSpeed + adjustmentFactor * Math.random(), 0, 1),
          clamp(currentPrediction.forwardSpeed + adjustmentFactor * Math.random(), 0, 1),
        ];

        targets.push(target);
      }

      // Train the model
      const inputTensor = tf.tensor2d(inputs);
      const targetTensor = tf.tensor2d(targets);

      try {
        await this.model.fit(inputTensor, targetTensor, {
          epochs: 1,
          verbose: 0,
          batchSize: Math.min(32, inputs.length),
        });
      } finally {
        inputTensor.dispose();
        targetTensor.dispose();
      }
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      this.isTraining = false;
    }
  }

  private stateToNetworkInput(
    state: AgentState,
    shapes: Shape[],
    canvasWidth: number,
    canvasHeight: number
  ): NetworkInput {
    // This mirrors the Agent.getNetworkInput() method
    const normalizedX = state.position.x / canvasWidth;
    const normalizedY = state.position.y / canvasHeight;
    
    // Find distances to each shape type
    const circleShape = shapes.find(s => s.type === 'circle');
    const squareShape = shapes.find(s => s.type === 'square');
    const triangleShape = shapes.find(s => s.type === 'triangle');
    
    const distToCircle = circleShape ? distanceToShape(state.position, circleShape) / 100 : 1;
    const distToSquare = squareShape ? distanceToShape(state.position, squareShape) / 100 : 1;
    const distToTriangle = triangleShape ? distanceToShape(state.position, triangleShape) / 100 : 1;
    
    const normalizedHeading = state.heading / (2 * Math.PI);
    const normalizedVelocity = state.velocity / 2.0; // Assuming max speed of 2.0

    return {
      posX: clamp(normalizedX, 0, 1),
      posY: clamp(normalizedY, 0, 1),
      distToCircle: clamp(distToCircle, 0, 1),
      distToSquare: clamp(distToSquare, 0, 1),
      distToTriangle: clamp(distToTriangle, 0, 1),
      heading: clamp(normalizedHeading, 0, 1),
      velocity: clamp(normalizedVelocity, 0, 1),
    };
  }

  async saveModel(name: string = 'shaping-lab-model'): Promise<void> {
    try {
      await this.model.save(`localstorage://${name}`);
      console.log('Model saved successfully');
    } catch (error) {
      console.error('Error saving model:', error);
    }
  }

  async loadModel(name: string = 'shaping-lab-model'): Promise<boolean> {
    try {
      const loadedModel = await tf.loadLayersModel(`localstorage://${name}`) as tf.Sequential;
      this.model.dispose(); // Clean up old model
      this.model = loadedModel;
      this.model.compile({
        optimizer: this.optimizer,
        loss: 'meanSquaredError',
      });
      console.log('Model loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      return false;
    }
  }

  resetModel(): void {
    this.model.dispose();
    this.model = this.createModel();
  }

  isCurrentlyTraining(): boolean {
    return this.isTraining;
  }

  dispose(): void {
    this.model.dispose();
    this.optimizer.dispose();
  }
}
