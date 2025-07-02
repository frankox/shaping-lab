import * as tf from '@tensorflow/tfjs';
import { NetworkInput, NetworkOutput, AgentState, Shape, NetworkArchitecture } from './types';
import { clamp, distanceToShape } from './utils';

export class NeuralNetworkWrapper {
  private model: tf.LayersModel;
  private optimizer: tf.Optimizer;
  private isTraining: boolean = false;
  private learningRate: number = 0.001;
  private cachedPrediction: NetworkOutput | null = null;
  private lastPredictionTime: number = 0;
  private predictionCacheTimeout: number = 50; // Cache for 50ms
  private explorationRate: number = 0.3; // Higher for more exploration
  private step: number = 0;
  private architecture: NetworkArchitecture = 'simple-mlp';
  private sequenceBuffer: number[][] = []; // For LSTM sequences
  private maxSequenceLength: number = 10; // Store last 10 states for LSTM

  constructor(architecture: NetworkArchitecture = 'simple-mlp') {
    this.architecture = architecture;
    this.optimizer = tf.train.adam(this.learningRate);
    this.model = this.createModel();
  }

  private createModel(): tf.LayersModel {
    switch (this.architecture) {
      case 'simple-mlp':
        return this.createSimpleMLP();
      case 'residual-mlp':
        return this.createResidualMLP();
      case 'recurrent-lstm':
        return this.createLSTM();
      default:
        return this.createSimpleMLP();
    }
  }

  private createSimpleMLP(): tf.Sequential {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          inputShape: [7], // 7 input features
          kernelInitializer: 'randomNormal',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
        }),
        tf.layers.dropout({ rate: 0.1 }),
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          kernelInitializer: 'randomNormal',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
        }),
        tf.layers.dropout({ rate: 0.1 }),
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

  private createResidualMLP(): tf.LayersModel {
    const input = tf.input({ shape: [7] });
    
    // First dense layer
    const dense1 = tf.layers.dense({
      units: 64,
      activation: 'relu',
      kernelInitializer: 'randomNormal',
    }).apply(input) as tf.SymbolicTensor;
    
    // Second dense layer
    const dense2 = tf.layers.dense({
      units: 64,
      activation: 'relu',
      kernelInitializer: 'randomNormal',
    }).apply(dense1) as tf.SymbolicTensor;
    
    // Add residual connection
    const residual = tf.layers.add().apply([dense1, dense2]) as tf.SymbolicTensor;
    
    // Third dense layer
    const dense3 = tf.layers.dense({
      units: 32,
      activation: 'relu',
      kernelInitializer: 'randomNormal',
    }).apply(residual) as tf.SymbolicTensor;
    
    // Output layer
    const output = tf.layers.dense({
      units: 3,
      activation: 'tanh',
      kernelInitializer: 'randomNormal',
    }).apply(dense3) as tf.SymbolicTensor;

    const model = tf.model({ inputs: input, outputs: output });
    
    model.compile({
      optimizer: this.optimizer,
      loss: 'meanSquaredError',
    });

    return model;
  }

  private createLSTM(): tf.Sequential {
    const model = tf.sequential({
      layers: [
        tf.layers.lstm({
          units: 16,
          inputShape: [this.maxSequenceLength, 7], // sequences of 7 features
          returnSequences: false,
        }),
        tf.layers.dense({
          units: 16,
          activation: 'relu',
          kernelInitializer: 'randomNormal',
        }),
        tf.layers.dense({
          units: 3,
          activation: 'tanh',
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

  private addToSequenceBuffer(input: number[]): void {
    this.sequenceBuffer.push(input);
    
    // Keep only the last maxSequenceLength states
    if (this.sequenceBuffer.length > this.maxSequenceLength) {
      this.sequenceBuffer.shift();
    }
  }

  private getSequenceInput(): number[][] {
    // If we don't have enough data, pad with zeros
    while (this.sequenceBuffer.length < this.maxSequenceLength) {
      this.sequenceBuffer.unshift(new Array(7).fill(0));
    }
    
    return this.sequenceBuffer.slice();
  }

  async predict(input: NetworkInput): Promise<NetworkOutput> {
    const inputArray = [
      input.posX,
      input.posY,
      input.distToCircle,
      input.distToSquare,
      input.distToTriangle,
      input.heading,
      input.velocity,
    ];

    return tf.tidy(() => {
      let inputTensor: tf.Tensor;

      if (this.architecture === 'recurrent-lstm') {
        // Add current input to sequence buffer
        this.addToSequenceBuffer(inputArray);
        
        // Create sequence tensor for LSTM
        const sequenceData = this.getSequenceInput();
        inputTensor = tf.tensor3d([sequenceData]); // [batch, time, features]
      } else {
        // Create regular tensor for MLP architectures
        inputTensor = tf.tensor2d([inputArray]);
      }

      const prediction = this.model.predict(inputTensor) as tf.Tensor;
      const values = prediction.dataSync(); // Use dataSync for synchronous operation in tidy

      // Convert tanh output [-1, 1] to desired ranges
      let rotationDirection = values[0]; // Keep [-1, 1]
      let rotationSpeed = (values[1] + 1) / 2; // Convert to [0, 1]
      let forwardSpeed = (values[2] + 1) / 2; // Convert to [0, 1]

      // Add exploration noise that decreases over time
      this.step++;
      const decayRate = 0.9995; // Slow decay
      const currentExplorationRate = this.explorationRate * Math.pow(decayRate, this.step);
      
      if (Math.random() < currentExplorationRate) {
        // Add exploration noise
        rotationDirection += (Math.random() - 0.5) * 0.4;
        rotationSpeed = Math.random() * 0.8; // More varied rotation
        forwardSpeed = Math.random() * 0.6; // More varied speed
      }

      const result = {
        rotationDirection: clamp(rotationDirection, -1, 1),
        rotationSpeed: clamp(rotationSpeed, 0, 1),
        forwardSpeed: clamp(forwardSpeed, 0, 1),
      };

      // Cache the prediction
      this.cachedPrediction = result;
      this.lastPredictionTime = performance.now();

      return result;
    });
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

      // First, get all current predictions in batch to avoid tensor shape issues
      const networkInputs: NetworkInput[] = [];
      for (let i = 0; i < states.length; i++) {
        const state = states[i];
        const networkInput = this.stateToNetworkInput(state, shapes, canvasWidth, canvasHeight);
        networkInputs.push(networkInput);
      }

      // Get current predictions for all states in batch
      const currentPredictions: NetworkOutput[] = [];
      for (const networkInput of networkInputs) {
        // Use tf.tidy to manage tensor memory properly
        const prediction = tf.tidy(() => {
          const inputArray = [
            networkInput.posX,
            networkInput.posY,
            networkInput.distToCircle,
            networkInput.distToSquare,
            networkInput.distToTriangle,
            networkInput.heading,
            networkInput.velocity,
          ];

          let inputTensor: tf.Tensor;
          if (this.architecture === 'recurrent-lstm') {
            this.addToSequenceBuffer(inputArray);
            const sequenceData = this.getSequenceInput();
            inputTensor = tf.tensor3d([sequenceData]);
          } else {
            inputTensor = tf.tensor2d([inputArray]);
          }

          const predictionTensor = this.model.predict(inputTensor) as tf.Tensor;
          const values = predictionTensor.dataSync(); // Use dataSync for sync operation
          
          return {
            rotationDirection: values[0],
            rotationSpeed: (values[1] + 1) / 2,
            forwardSpeed: (values[2] + 1) / 2,
          };
        });
        
        currentPredictions.push(prediction);
      }

      // Now process targets based on predictions
      for (let i = 0; i < states.length; i++) {
        const reward = rewards[i];
        const networkInput = networkInputs[i];
        const currentPrediction = currentPredictions[i];

        const inputArray = [
          networkInput.posX,
          networkInput.posY,
          networkInput.distToCircle,
          networkInput.distToSquare,
          networkInput.distToTriangle,
          networkInput.heading,
          networkInput.velocity,
        ];
        
        inputs.push(inputArray);

        // Improved learning strategy based on reward
        let target: number[];
        
        if (reward > 0) {
          // Positive reward: reinforce current behavior and encourage exploration
          target = [
            clamp(currentPrediction.rotationDirection + (Math.random() - 0.5) * 0.1, -1, 1),
            clamp(currentPrediction.rotationSpeed + Math.random() * 0.1, 0, 1),
            clamp(currentPrediction.forwardSpeed + Math.random() * 0.1, 0, 1),
          ];
        } else if (reward < 0) {
          // Negative reward: discourage current behavior, encourage different actions
          target = [
            clamp(currentPrediction.rotationDirection + (Math.random() - 0.5) * 0.5, -1, 1),
            clamp(0.3 + Math.random() * 0.6, 0, 1), // Encourage more rotation
            clamp(Math.random() * 0.4, 0, 1), // Reduce forward speed
          ];
        } else {
          // Neutral reward: encourage exploration with slight bias toward movement
          target = [
            clamp((Math.random() - 0.5) * 0.8, -1, 1), // More varied rotation
            clamp(0.2 + Math.random() * 0.6, 0, 1), // Moderate rotation speed
            clamp(0.1 + Math.random() * 0.4, 0, 1), // Slight forward bias
          ];
        }

        targets.push(target);
      }

      let inputTensor: tf.Tensor;
      let targetTensor: tf.Tensor;

      if (this.architecture === 'recurrent-lstm') {
        // For LSTM, we need to create sequences
        const sequences: number[][][] = [];
        const sequenceTargets: number[][] = [];
        
        for (let i = 0; i < inputs.length; i++) {
          // Create a sequence ending with this input
          const sequence: number[][] = [];
          for (let j = Math.max(0, i - this.maxSequenceLength + 1); j <= i; j++) {
            sequence.push(inputs[j] || new Array(7).fill(0));
          }
          
          // Pad if needed
          while (sequence.length < this.maxSequenceLength) {
            sequence.unshift(new Array(7).fill(0));
          }
          
          sequences.push(sequence);
          sequenceTargets.push(targets[i]);
        }
        
        inputTensor = tf.tensor3d(sequences);
        targetTensor = tf.tensor2d(sequenceTargets);
      } else {
        // For MLP architectures
        inputTensor = tf.tensor2d(inputs);
        targetTensor = tf.tensor2d(targets);
      }

      try {
        await this.model.fit(inputTensor, targetTensor, {
          epochs: 1,
          verbose: 0,
          batchSize: Math.min(8, inputs.length), // Smaller batch size to avoid memory issues
        });
      } catch (fitError) {
        console.error('Model fit error:', fitError);
        console.log('Input tensor shape:', inputTensor.shape);
        console.log('Target tensor shape:', targetTensor.shape);
        console.log('Architecture:', this.architecture);
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
    
    // Use sine for heading to avoid boundary issues
    const headingSin = Math.sin(state.heading);
    const normalizedVelocity = state.velocity / 2.0; // Assuming max speed of 2.0

    return {
      posX: clamp(normalizedX, 0, 1),
      posY: clamp(normalizedY, 0, 1),
      distToCircle: clamp(distToCircle, 0, 1),
      distToSquare: clamp(distToSquare, 0, 1),
      distToTriangle: clamp(distToTriangle, 0, 1),
      heading: clamp((headingSin + 1) / 2, 0, 1), // Convert sin to [0,1]
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
      const loadedModel = await tf.loadLayersModel(`localstorage://${name}`) as tf.LayersModel;
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
    this.step = 0; // Reset exploration step
    this.sequenceBuffer = []; // Reset sequence buffer for LSTM
  }

  switchArchitecture(newArchitecture: NetworkArchitecture): void {
    if (newArchitecture !== this.architecture) {
      this.architecture = newArchitecture;
      this.resetModel();
    }
  }

  getCurrentArchitecture(): NetworkArchitecture {
    return this.architecture;
  }

  isCurrentlyTraining(): boolean {
    return this.isTraining;
  }

  dispose(): void {
    this.model.dispose();
    this.optimizer.dispose();
  }
}

