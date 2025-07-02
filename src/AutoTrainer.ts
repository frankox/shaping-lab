import { AgentState, AutoTrainingEvent } from './types';
import { DemoScenario } from './demoScenarios';
import { SHAPES } from './types';

export class AutoTrainer {
  private scenario: DemoScenario | null = null;
  private isActive: boolean = false;
  private interval: number = 200; // milliseconds
  private timer: ReturnType<typeof setInterval> | null = null;
  private onTrainingEvent: (event: AutoTrainingEvent) => void;
  private getAgentState: () => AgentState | null;

  constructor(
    onTrainingEvent: (event: AutoTrainingEvent) => void,
    getAgentState: () => AgentState | null
  ) {
    this.onTrainingEvent = onTrainingEvent;
    this.getAgentState = getAgentState;
  }

  setScenario(scenario: DemoScenario | null): void {
    this.scenario = scenario;
    if (this.isActive && !scenario) {
      this.stop();
    }
  }

  setInterval(interval: number): void {
    this.interval = interval;
    if (this.isActive) {
      this.stop();
      this.start();
    }
  }

  start(): void {
    if (!this.scenario || this.isActive) {
      return;
    }

    this.isActive = true;
    this.timer = setInterval(() => {
      this.evaluateAgent();
    }, this.interval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isActive = false;
  }

  isRunning(): boolean {
    return this.isActive;
  }

  private evaluateAgent(): void {
    if (!this.scenario || !this.isActive) {
      return;
    }

    const agentState = this.getAgentState();
    if (!agentState) {
      return;
    }

    try {
      const trainingEvent = this.scenario.autoTrainingLogic(agentState, SHAPES);
      if (trainingEvent) {
        this.onTrainingEvent(trainingEvent);
      }
    } catch (error) {
      console.error('Error in auto training logic:', error);
    }
  }

  dispose(): void {
    this.stop();
    this.scenario = null;
  }
}
