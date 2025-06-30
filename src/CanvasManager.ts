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
  private fps: number = 30;
  private frameInterval: number = 1000 / this.fps;
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
    
    const gameLoop = async (currentTime: number) => {
      if (!this.isRunning) return;

      const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
      
      if (deltaTime >= this.frameInterval / 1000) {
        this.clear();
        renderCallback(deltaTime);
        this.lastFrameTime = currentTime;
      }

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
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw background
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  renderShapes(shapes: Shape[]): void {
    shapes.forEach(shape => this.renderShape(shape));
  }

  private renderShape(shape: Shape): void {
    this.ctx.save();
    this.ctx.fillStyle = shape.color;
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 2;

    switch (shape.type) {
      case 'circle':
        this.ctx.beginPath();
        this.ctx.arc(shape.position.x, shape.position.y, shape.size / 2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.stroke();
        break;

      case 'square':
        const halfSize = shape.size / 2;
        this.ctx.fillRect(
          shape.position.x - halfSize,
          shape.position.y - halfSize,
          shape.size,
          shape.size
        );
        this.ctx.strokeRect(
          shape.position.x - halfSize,
          shape.position.y - halfSize,
          shape.size,
          shape.size
        );
        break;

      case 'triangle':
        const height = shape.size * 0.866; // Equilateral triangle height
        this.ctx.beginPath();
        this.ctx.moveTo(shape.position.x, shape.position.y - height / 2);
        this.ctx.lineTo(shape.position.x - shape.size / 2, shape.position.y + height / 2);
        this.ctx.lineTo(shape.position.x + shape.size / 2, shape.position.y + height / 2);
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
  }): void {
    this.ctx.save();
    this.ctx.fillStyle = '#333';
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';

    let y = 20;
    const lineHeight = 20;

    if (info.fps !== undefined) {
      this.ctx.fillText(`FPS: ${info.fps.toFixed(1)}`, 10, y);
      y += lineHeight;
    }

    if (info.stateBufferSize !== undefined) {
      this.ctx.fillText(`Buffer: ${info.stateBufferSize} states`, 10, y);
      y += lineHeight;
    }

    if (info.timeSinceLastLearning !== undefined) {
      const seconds = (info.timeSinceLastLearning / 1000).toFixed(1);
      this.ctx.fillText(`Last learning: ${seconds}s ago`, 10, y);
      y += lineHeight;
    }

    if (info.isTraining) {
      this.ctx.fillStyle = '#FF5722';
      this.ctx.fillText('Training...', 10, y);
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
