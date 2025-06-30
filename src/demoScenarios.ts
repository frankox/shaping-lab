// Demo scenarios for the Shaping Lab

export interface DemoScenario {
  name: string;
  description: string;
  config: Partial<import('./types').AppConfig>;
  instructions: string[];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    name: "Basic Circle Training",
    description: "Teach the agent to stay inside the green circle using manual rewards",
    config: {
      intrinsicPunishment: false,
      gradientReward: false,
      manualPunishmentEnabled: false,
      rewardMin: 0,
      rewardMax: 1,
    },
    instructions: [
      "Watch the agent move randomly around the canvas",
      "Click 'Reward' every time the agent enters the green circle",
      "After 5-10 rewards, notice the agent starts favoring the circle area",
      "Continue rewarding to strengthen the behavior",
      "Eventually, stop rewarding and observe if the behavior persists"
    ]
  },
  
  {
    name: "Advanced Circle Training with Gradient",
    description: "Enhanced training using gradient rewards for better learning",
    config: {
      intrinsicPunishment: false,
      gradientReward: true,
      manualPunishmentEnabled: false,
      rewardMin: 0,
      rewardMax: 1,
    },
    instructions: [
      "Enable gradient rewards in settings",
      "Reward the agent when it approaches or enters the circle",
      "The gradient system will reward all recent states leading to the reward",
      "This creates smoother learning and better path optimization",
      "Observe how the agent learns more complex approach patterns"
    ]
  },

  {
    name: "Circle Training with Intrinsic Punishment",
    description: "Complete training scenario with automatic discouragement of inactivity",
    config: {
      intrinsicPunishment: true,
      intrinsicTimeframe: 5,
      gradientReward: true,
      manualPunishmentEnabled: false,
      rewardMin: 0,
      rewardMax: 1,
    },
    instructions: [
      "Enable intrinsic punishment (5 second timeframe)",
      "Enable gradient rewards",
      "The agent will receive neutral punishment if no manual reward is given",
      "Reward the agent for entering/staying in the circle",
      "Notice how intrinsic punishment encourages exploration",
      "The agent should learn to stay active and seek rewards"
    ]
  },

  {
    name: "Shape Avoidance Training",
    description: "Train the agent to avoid certain shapes using punishment",
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
    instructions: [
      "Enable both manual punishment and intrinsic punishment",
      "Reward the agent for staying in the circle",
      "Punish the agent when it touches the square or triangle",
      "Use gradient punishments to discourage approach paths",
      "Observe how the agent learns to navigate around obstacles",
      "The agent should develop complex avoidance behaviors"
    ]
  },

  {
    name: "Exploration vs Exploitation",
    description: "Balance between encouraging exploration and rewarding good behavior",
    config: {
      intrinsicPunishment: true,
      intrinsicTimeframe: 10,
      gradientReward: true,
      manualPunishmentEnabled: false,
      rewardMin: 0.2,
      rewardMax: 1,
    },
    instructions: [
      "Set reward minimum to 0.2 (encourages some exploration)",
      "Long intrinsic punishment timeframe (10 seconds)",
      "Reward the agent intermittently for circle visits",
      "Don't reward every circle entry - create uncertainty",
      "Observe how the agent balances staying in the circle vs exploring",
      "This mimics real-world reinforcement learning scenarios"
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
