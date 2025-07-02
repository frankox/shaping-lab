// Demo scenarios for the Shaping Lab

import { Shape, AgentState, AutoTrainingEvent } from './types';
import { isInsideShape, distanceToShape } from './utils';

export interface DemoScenario {
  name: string;
  description: string;
  config: Partial<import('./types').AppConfig>;
  instructions: string[];
  lockedSettings: (keyof import('./types').AppConfig)[];
  autoTrainingLogic: (agentState: AgentState, shapes: Shape[]) => AutoTrainingEvent | null;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    name: "Basic Circle Training (Auto)",
    description: "Automatically rewards the agent when inside the green circle",
    config: {
      intrinsicPunishment: true,
      intrinsicTimeframe: 8,
      intrinsicGradientPunishmentMin: 0,
      intrinsicGradientPunishmentMax: 0.3,
      gradientReward: false,
      manualPunishmentEnabled: false,
      rewardMin: 0,
      rewardMax: 1,
    },
    lockedSettings: ['manualPunishmentEnabled'],
    autoTrainingLogic: (agentState: AgentState, shapes: Shape[]) => {
      const circleShape = shapes.find(s => s.type === 'circle');
      if (circleShape && isInsideShape(agentState.position, circleShape)) {
        return {
          type: 'reward',
          value: 1,
          reason: 'Agent is inside the target circle'
        };
      }
      return null;
    },
    instructions: [
      "This demo automatically rewards the agent when it enters the green circle",
      "Watch how the agent learns to stay in the circle without manual input",
      "Manual punishment is disabled for this scenario",
      "Intrinsic punishment is enabled to encourage exploration and activity",
      "You can adjust the intrinsic punishment timeframe and values in settings",
      "The agent will gradually learn to prefer the circle area",
      "Notice how consistent automatic rewards lead to stable behavior"
    ]
  },
  
  {
    name: "Advanced Circle Training with Gradient (Auto)",
    description: "Enhanced automatic training using gradient rewards for better learning",
    config: {
      intrinsicPunishment: true,
      intrinsicTimeframe: 10,
      intrinsicGradientPunishmentMin: 0,
      intrinsicGradientPunishmentMax: 0.2,
      gradientReward: true,
      manualPunishmentEnabled: false,
      rewardMin: 0,
      rewardMax: 1,
    },
    lockedSettings: ['manualPunishmentEnabled', 'gradientReward'],
    autoTrainingLogic: (agentState: AgentState, shapes: Shape[]) => {
      const circleShape = shapes.find(s => s.type === 'circle');
      if (circleShape && isInsideShape(agentState.position, circleShape)) {
        return {
          type: 'reward',
          value: 1,
          reason: 'Agent is inside the target circle (gradient mode)'
        };
      }
      return null;
    },
    instructions: [
      "Gradient rewards are automatically enabled for smoother learning",
      "The system rewards all recent states when the agent enters the circle",
      "This creates better path optimization than simple rewards",
      "Intrinsic punishment is enabled to maintain agent activity",
      "You can configure intrinsic punishment timeframe and intensity",
      "Observe how the agent learns more complex approach patterns",
      "Gradient mode is locked and cannot be changed in this scenario"
    ]
  },

  {
    name: "Shape Avoidance Training (Auto)",
    description: "Automatically rewards circle entry and punishes shape collisions",
    config: {
      intrinsicPunishment: true,
      intrinsicTimeframe: 8,
      gradientReward: true,
      manualPunishmentEnabled: true,
      rewardMin: 0,
      rewardMax: 1,
      gradientPunishmentMin: 0,
      gradientPunishmentMax: 1,
    },
    lockedSettings: ['manualPunishmentEnabled', 'gradientReward'],
    autoTrainingLogic: (agentState: AgentState, shapes: Shape[]) => {
      const circleShape = shapes.find(s => s.type === 'circle');
      const squareShape = shapes.find(s => s.type === 'square');
      const triangleShape = shapes.find(s => s.type === 'triangle');
      
      // Check for collisions with forbidden shapes (very close proximity)
      const collisionThreshold = 5;
      
      if (squareShape && distanceToShape(agentState.position, squareShape) < collisionThreshold) {
        return {
          type: 'punishment',
          value: -1,
          reason: 'Agent is too close to the square (forbidden)'
        };
      }
      
      if (triangleShape && distanceToShape(agentState.position, triangleShape) < collisionThreshold) {
        return {
          type: 'punishment',
          value: -1,
          reason: 'Agent is too close to the triangle (forbidden)'
        };
      }
      
      // Reward for being in the circle
      if (circleShape && isInsideShape(agentState.position, circleShape)) {
        return {
          type: 'reward',
          value: 1,
          reason: 'Agent is safely inside the target circle'
        };
      }
      
      return null;
    },
    instructions: [
      "This scenario automatically rewards circle entry and punishes shape collisions",
      "The agent learns to navigate around the square and triangle",
      "Gradient punishments discourage approach paths to forbidden shapes",
      "Manual punishment is enabled but locked - the system handles it automatically",
      "Observe complex avoidance behaviors developing over time"
    ]
  },

  {
    name: "Exploration Encouragement (Auto)",
    description: "Rewards the agent for exploring new areas of the canvas",
    config: {
      intrinsicPunishment: true,
      intrinsicTimeframe: 10,
      intrinsicGradientPunishmentMin: 0,
      intrinsicGradientPunishmentMax: 0.1,
      gradientReward: true,
      manualPunishmentEnabled: false,
      rewardMin: 0.2,
      rewardMax: 1,
    },
    lockedSettings: ['manualPunishmentEnabled'],
    autoTrainingLogic: (() => {
      const visitedAreas = new Set<string>();
      const gridSize = 50; // Divide canvas into 50x50 pixel grid cells
      
      return (agentState: AgentState, _shapes: Shape[]) => {
        // Create a grid-based exploration system
        const gridX = Math.floor(agentState.position.x / gridSize);
        const gridY = Math.floor(agentState.position.y / gridSize);
        const cellKey = `${gridX},${gridY}`;
        
        if (!visitedAreas.has(cellKey)) {
          visitedAreas.add(cellKey);
          return {
            type: 'reward',
            value: 0.5,
            reason: `Explored new area at grid ${gridX},${gridY}`
          };
        }
        
        return null;
      };
    })(),
    instructions: [
      "This scenario encourages exploration of new canvas areas",
      "The agent receives rewards for visiting previously unexplored grid cells",
      "Intrinsic punishment is enabled with a long timeframe for extended exploration",
      "You can adjust intrinsic punishment settings to change exploration behavior",
      "Reward minimum is set to 0.2 to encourage continued movement",
      "Observe how the agent develops systematic exploration patterns"
    ]
  }
];

export function applyDemoScenario(
  scenario: DemoScenario,
  setConfig: (config: any) => void
): void {
  setConfig((prevConfig: any) => ({
    ...prevConfig,
    ...scenario.config
  }));
}

export function getLockedSettings(scenario: DemoScenario | null): Set<keyof import('./types').AppConfig> {
  return scenario ? new Set(scenario.lockedSettings) : new Set();
}

export function findScenarioByName(name: string): DemoScenario | null {
  return DEMO_SCENARIOS.find(scenario => scenario.name === name) || null;
}
