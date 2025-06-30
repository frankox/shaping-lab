import { Agent } from './Agent';
import { Shape, Vector2D } from './types';
import { createCanvas } from './utils';

export class CanvasManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private isRunning: boolean = false;
  private lastFrameTime: number = 0;
  private animationId: number | null = null;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas = createCanvas(width, height);
    
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to get 2D context from canvas');
    }
    this.ctx = context;
    
    this.setupCanvas();
  }

  private setupCanvas(): void {
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // Set up for smooth rendering
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Ensure pixel-perfect rendering
    this.canvas.style.imageRendering = 'auto';
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.setupCanvas();
  }

  start(renderCallback: (deltaTime: number) => void): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    
    const gameLoop = (currentTime: number) => {
      if (!this.isRunning) return;

      const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
      
      // Always render - let requestAnimationFrame handle the timing
      this.clear();
      renderCallback(deltaTime);
      this.lastFrameTime = currentTime;

      this.animationId = requestAnimationFrame(gameLoop);
    };

    this.animationId = requestAnimationFrame(gameLoop);
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  pause(): void {
    this.stop();
  }

  resume(renderCallback: (deltaTime: number) => void): void {
    this.start(renderCallback);
  }

  clear(): void {
    // Use efficient clearing method
    this.ctx.save();
    
    // Clear the entire canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background efficiently
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.restore();
  }

  renderShapes(shapes: Shape[]): void {
    shapes.forEach(shape => this.renderShape(shape));
  }

  private renderShape(shape: Shape): void {
    this.ctx.save();
    
    // Use sub-pixel positioning for smoother rendering
    const x = Math.round(shape.position.x * 10) / 10;
    const y = Math.round(shape.position.y * 10) / 10;
    
    this.ctx.fillStyle = shape.color;
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    switch (shape.type) {
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(x, y, shape.size / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        break;

      case 'square':
        const halfSize = shape.size / 2;
        this.ctx.fillRect(
          x - halfSize,
          y - halfSize,
          shape.size,
          shape.size
        );
        this.ctx.strokeRect(
          x - halfSize,
          y - halfSize,
          shape.size,
          shape.size
        );
        break;

      case 'triangle':
        const height = shape.size * 0.866; // Equilateral triangle height
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - height / 2);
        this.ctx.lineTo(x - shape.size / 2, y + height / 2);
        this.ctx.lineTo(x + shape.size / 2, y + height / 2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        break;
    }

    this.ctx.restore();
  }

  renderAgent(agent: Agent): void {
    agent.render(this.ctx);
  }

  renderInfo(info: {
    fps?: number;
    stateBufferSize?: number;
    timeSinceLastLearning?: number;
    isTraining?: boolean;
    agentPosition?: { x: number; y: number };
    agentHeading?: number;
    agentVelocity?: number;
    networkOutput?: { rotationDirection: number; rotationSpeed: number; forwardSpeed: number };
  }): void {
    this.ctx.save();
    
    // Set up text rendering for better performance
    this.ctx.fillStyle = '#333';
    this.ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    let y = 15;
    const lineHeight = 18;
    const padding = 8;

    // Create a semi-transparent background for better readability
    const texts = [];
    if (info.fps !== undefined) {
      texts.push(`FPS: ${info.fps.toFixed(1)}`);
    }
    if (info.stateBufferSize !== undefined) {
      texts.push(`Buffer: ${info.stateBufferSize} states`);
    }
    if (info.timeSinceLastLearning !== undefined) {
      const seconds = (info.timeSinceLastLearning / 1000).toFixed(1);
      texts.push(`Last learning: ${seconds}s ago`);
    }
    if (info.isTraining) {
      texts.push('Training...');
    }
    if (info.agentPosition) {
      texts.push(`Pos: (${info.agentPosition.x.toFixed(0)}, ${info.agentPosition.y.toFixed(0)})`);
    }
    if (info.agentHeading !== undefined) {
      texts.push(`Heading: ${(info.agentHeading * 180 / Math.PI).toFixed(0)}°`);
    }
    if (info.agentVelocity !== undefined) {
      texts.push(`Velocity: ${info.agentVelocity.toFixed(2)}`);
    }
    if (info.networkOutput) {
      texts.push(`Rot Dir: ${info.networkOutput.rotationDirection.toFixed(2)}`);
      texts.push(`Rot Speed: ${info.networkOutput.rotationSpeed.toFixed(2)}`);
      texts.push(`Fwd Speed: ${info.networkOutput.forwardSpeed.toFixed(2)}`);
    }

    if (texts.length > 0) {
      // Draw background
      const maxWidth = Math.max(...texts.map(text => this.ctx.measureText(text).width));
      const bgHeight = texts.length * lineHeight + padding;
      
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.ctx.fillRect(5, 5, maxWidth + padding * 2, bgHeight);
      
      // Draw border
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(5, 5, maxWidth + padding * 2, bgHeight);
      
      // Draw text
      this.ctx.fillStyle = '#333';
      texts.forEach((text, index) => {
        if (index === texts.length - 1 && info.isTraining) {
          this.ctx.fillStyle = '#F44336'; // Red for training indicator
        }
        this.ctx.fillText(text, 5 + padding, y + index * lineHeight);
      });
    }

    this.ctx.restore();
  }

  renderRewardFeedback(position: Vector2D, type: 'reward' | 'punishment'): void {
    this.ctx.save();
    
    const color = type === 'reward' ? '#4CAF50' : '#F44336';
    const text = type === 'reward' ? '+' : '-';
    
    this.ctx.fillStyle = color;
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // Add a subtle glow effect
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 10;
    
    this.ctx.fillText(text, position.x, position.y);
    
    this.ctx.restore();
  }

  getMousePosition(event: MouseEvent): Vector2D {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  isPointInCanvas(point: Vector2D): boolean {
    return point.x >= 0 && point.x <= this.width && point.y >= 0 && point.y <= this.height;
  }

  dispose(): void {
    this.stop();
  }
}
