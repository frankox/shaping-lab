// Core types for the shaping lab application

export interface Vector2D {
  x: number;
  y: number;
}

export interface AgentState {
  position: Vector2D;
  heading: number; // rotation in radians
  velocity: number;
  timestamp: number;
}

export interface NetworkInput {
  posX: number;
  posY: number;
  distToSquare: number;
  distToCircle: number;
  distToTriangle: number;
  heading: number;
  velocity: number;
}

export interface NetworkOutput {
  rotationDirection: number; // -1 to 1 (left to right)
  rotationSpeed: number; // 0 to 1
  forwardSpeed: number; // 0 to 1
}

export interface LearningEvent {
  states: AgentState[];
  reward: number; // Single reward value for non-gradient mode
  rewards?: number[]; // Array of reward values for gradient mode
  isGradient: boolean;
  timestamp: number;
}

export type NetworkArchitecture = 'simple-mlp' | 'residual-mlp' | 'recurrent-lstm';

export interface AppConfig {
  intrinsicPunishment: boolean;
  intrinsicTimeframe: number; // seconds
  intrinsicGradientPunishmentMin: number;
  intrinsicGradientPunishmentMax: number;
  gradientReward: boolean;
  rewardAmount: number; // Fixed reward amount when gradient is disabled
  rewardMin: number;
  rewardMax: number;
  rewardBufferSize: number; // Buffer size for reward gradients
  manualPunishmentEnabled: boolean;
  gradientPunishment: boolean; // Gradient toggle for manual punishment
  punishmentAmount: number; // Fixed punishment amount when gradient is disabled
  gradientPunishmentMin: number;
  gradientPunishmentMax: number;
  punishmentBufferSize: number; // Buffer size for punishment gradients
  intrinsicBufferSize: number; // Buffer size for intrinsic punishment gradients
  canvasWidth: number;
  canvasHeight: number;
  networkArchitecture: NetworkArchitecture;
}

export interface Shape {
  type: 'circle' | 'square' | 'triangle';
  position: Vector2D;
  size: number;
  color: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  intrinsicPunishment: false,
  intrinsicTimeframe: 10,
  intrinsicGradientPunishmentMin: 0,
  intrinsicGradientPunishmentMax: 1,
  gradientReward: false,
  rewardAmount: 1,
  rewardMin: 0,
  rewardMax: 1,
  rewardBufferSize: 100, // Default buffer size for reward gradients
  manualPunishmentEnabled: false,
  gradientPunishment: false,
  punishmentAmount: 1,
  gradientPunishmentMin: 0,
  gradientPunishmentMax: 1,
  punishmentBufferSize: 100, // Default buffer size for punishment gradients
  intrinsicBufferSize: 100, // Default buffer size for intrinsic punishment gradients
  canvasWidth: 800,
  canvasHeight: 600,
  networkArchitecture: 'simple-mlp',
};

export const SHAPES: Shape[] = [
  {
    type: 'circle',
    position: { x: 200, y: 200 },
    size: 80,
    color: '#4CAF50',
  },
  {
    type: 'square',
    position: { x: 600, y: 150 },
    size: 70,
    color: '#2196F3',
  },
  {
    type: 'triangle',
    position: { x: 400, y: 450 },
    size: 75,
    color: '#FF9800',
  },
];
