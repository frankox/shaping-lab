import { AgentState, LearningEvent, AppConfig } from './types';
import { generateGradientRewards } from './utils';

export class RewardManager {
  private stateBuffer: AgentState[] = [];
  private lastLearningTime: number = Date.now();
  private intrinsicPunishmentTimer: ReturnType<typeof setTimeout> | null = null;
  private config: AppConfig;
  private onLearningEvent: (event: LearningEvent) => void;
  private maxBufferSize: number = 80;

  constructor(
    config: AppConfig,
    onLearningEvent: (event: LearningEvent) => void
  ) {
    this.config = config;
    this.onLearningEvent = onLearningEvent;
    this.setupIntrinsicPunishment();
  }

  updateConfig(newConfig: AppConfig): void {
    this.config = newConfig;
    this.setupIntrinsicPunishment();
  }

  addState(state: AgentState): void {
    this.stateBuffer.push({ ...state });
    
    // Enforce max buffer size
    if (this.stateBuffer.length > this.maxBufferSize) {
      this.stateBuffer.shift(); // Remove oldest state
    }
  }

  applyManualReward(): void {
    if (this.stateBuffer.length === 0) return;

    this.resetIntrinsicPunishmentTimer();
    
    let states: AgentState[];
    let learningEvent: LearningEvent;

    if (this.config.gradientReward) {
      // Use all buffered states with gradient rewards
      states = [...this.stateBuffer];
      const gradientRewards = generateGradientRewards(
        states.length,
        this.config.rewardMin,
        this.config.rewardMax
      );

      learningEvent = {
        states,
        reward: this.config.rewardMax, // Keep for backward compatibility
        rewards: gradientRewards, // Use gradient rewards array
        isGradient: true,
        timestamp: Date.now(),
      };
    } else {
      // Use only the most recent state
      states = [this.stateBuffer[this.stateBuffer.length - 1]];
      
      learningEvent = {
        states,
        reward: this.config.rewardMax,
        isGradient: false,
        timestamp: Date.now(),
      };
    }

    this.onLearningEvent(learningEvent);
    this.clearStateBuffer();
    this.lastLearningTime = Date.now();
  }

  applyManualPunishment(): void {
    if (!this.config.manualPunishmentEnabled || this.stateBuffer.length === 0) {
      return;
    }

    this.resetIntrinsicPunishmentTimer();

    let states: AgentState[];
    let learningEvent: LearningEvent;

    if (this.config.gradientReward) {
      // Use all buffered states with gradient punishments (negative rewards)
      states = [...this.stateBuffer];
      const gradientRewards = generateGradientRewards(
        states.length,
        -this.config.gradientPunishmentMax,
        -this.config.gradientPunishmentMin
      );

      learningEvent = {
        states,
        reward: -this.config.gradientPunishmentMax, // Keep for backward compatibility
        rewards: gradientRewards, // Use gradient rewards array (negative values)
        isGradient: true,
        timestamp: Date.now(),
      };
    } else {
      // Use only the most recent state with negative reward  
      states = [this.stateBuffer[this.stateBuffer.length - 1]];
      
      learningEvent = {
        states,
        reward: -this.config.gradientPunishmentMax,
        isGradient: false,
        timestamp: Date.now(),
      };
    }

    this.onLearningEvent(learningEvent);
    this.clearStateBuffer();
    this.lastLearningTime = Date.now();
  }

  private setupIntrinsicPunishment(): void {
    this.clearIntrinsicPunishmentTimer();

    if (this.config.intrinsicPunishment) {
      this.resetIntrinsicPunishmentTimer();
    }
  }

  private resetIntrinsicPunishmentTimer(): void {
    this.clearIntrinsicPunishmentTimer();

    if (this.config.intrinsicPunishment) {
      this.intrinsicPunishmentTimer = setTimeout(() => {
        this.applyIntrinsicPunishment();
      }, this.config.intrinsicTimeframe * 1000);
    }
  }

  private clearIntrinsicPunishmentTimer(): void {
    if (this.intrinsicPunishmentTimer) {
      clearTimeout(this.intrinsicPunishmentTimer);
      this.intrinsicPunishmentTimer = null;
    }
  }

  private applyIntrinsicPunishment(): void {
    if (this.stateBuffer.length === 0) {
      this.resetIntrinsicPunishmentTimer();
      return;
    }

    // Intrinsic punishment is always in gradient mode with neutral (0) gradient
    const states = [...this.stateBuffer];
    // Generate neutral gradient (all zeros) - exponential doesn't matter for zeros
    const neutralRewards = new Array(states.length).fill(0);

    const learningEvent: LearningEvent = {
      states,
      reward: 0,
      rewards: neutralRewards,
      isGradient: true,
      timestamp: Date.now(),
    };

    this.onLearningEvent(learningEvent);
    this.clearStateBuffer();
    this.lastLearningTime = Date.now();
    this.resetIntrinsicPunishmentTimer();
  }

  private clearStateBuffer(): void {
    this.stateBuffer = [];
  }

  pause(): void {
    this.clearIntrinsicPunishmentTimer();
  }

  resume(): void {
    if (this.config.intrinsicPunishment) {
      this.resetIntrinsicPunishmentTimer();
    }
  }

  reset(): void {
    this.clearStateBuffer();
    this.clearIntrinsicPunishmentTimer();
    this.lastLearningTime = Date.now();
    
    if (this.config.intrinsicPunishment) {
      this.resetIntrinsicPunishmentTimer();
    }
  }

  getStateBufferSize(): number {
    return this.stateBuffer.length;
  }

  getTimeSinceLastLearning(): number {
    return Date.now() - this.lastLearningTime;
  }

  dispose(): void {
    this.clearIntrinsicPunishmentTimer();
    this.clearStateBuffer();
  }
}
