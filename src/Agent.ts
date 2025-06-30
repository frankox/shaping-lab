import { Vector2D, AgentState, NetworkOutput, NetworkInput, Shape } from './types';
import { normalizeAngle, clamp, distanceToShape } from './utils';

export class Agent {
  private position: Vector2D;
  private heading: number;
  private velocity: number;
  private maxSpeed: number = 2.0;
  private maxRotationSpeed: number = 0.1;
  private size: number = 10;
  private color: string = '#E91E63';

  constructor(
    initialPosition: Vector2D = { x: 100, y: 100 },
    initialHeading: number = 0
  ) {
    this.position = { ...initialPosition };
    this.heading = initialHeading;
    this.velocity = 0;
  }

  getState(): AgentState {
    return {
      position: { ...this.position },
      heading: this.heading,
      velocity: this.velocity,
      timestamp: Date.now(),
    };
  }

  setState(state: AgentState): void {
    this.position = { ...state.position };
    this.heading = state.heading;
    this.velocity = state.velocity;
  }

  getNetworkInput(shapes: Shape[], canvasWidth: number, canvasHeight: number): NetworkInput {
    // Normalize position to [0, 1] range
    const normalizedX = this.position.x / canvasWidth;
    const normalizedY = this.position.y / canvasHeight;
    
    // Find distances to each shape type
    const circleShape = shapes.find(s => s.type === 'circle');
    const squareShape = shapes.find(s => s.type === 'square');
    const triangleShape = shapes.find(s => s.type === 'triangle');
    
    const distToCircle = circleShape ? distanceToShape(this.position, circleShape) / 100 : 1;
    const distToSquare = squareShape ? distanceToShape(this.position, squareShape) / 100 : 1;
    const distToTriangle = triangleShape ? distanceToShape(this.position, triangleShape) / 100 : 1;
    
    // Normalize heading to [0, 1] range
    const normalizedHeading = this.heading / (2 * Math.PI);
    
    // Normalize velocity to [0, 1] range
    const normalizedVelocity = this.velocity / this.maxSpeed;

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

  applyAction(output: NetworkOutput, deltaTime: number): void {
    // Apply rotation
    const rotationAmount = output.rotationDirection * output.rotationSpeed * this.maxRotationSpeed * deltaTime;
    this.heading = normalizeAngle(this.heading + rotationAmount);
    
    // Apply forward movement
    this.velocity = output.forwardSpeed * this.maxSpeed;
    
    // Update position based on heading and velocity
    const deltaX = Math.cos(this.heading) * this.velocity * deltaTime;
    const deltaY = Math.sin(this.heading) * this.velocity * deltaTime;
    
    this.position.x += deltaX;
    this.position.y += deltaY;
  }

  constrainToCanvas(canvasWidth: number, canvasHeight: number): void {
    // Keep agent within canvas bounds with some padding
    const padding = this.size;
    this.position.x = clamp(this.position.x, padding, canvasWidth - padding);
    this.position.y = clamp(this.position.y, padding, canvasHeight - padding);
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    // Use sub-pixel positioning for smoother movement
    const x = Math.round(this.position.x * 10) / 10;
    const y = Math.round(this.position.y * 10) / 10;
    
    // Move to agent position
    ctx.translate(x, y);
    ctx.rotate(this.heading);
    
    // Enable anti-aliasing
    ctx.imageSmoothingEnabled = true;
    
    // Draw agent body (circle) with smooth edges
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Draw direction indicator (small triangle pointing forward)
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.size * 0.7, 0);
    ctx.lineTo(this.size * 0.3, -this.size * 0.3);
    ctx.lineTo(this.size * 0.3, this.size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw velocity indicator (trail) with alpha blending
    if (this.velocity > 0.1) {
      const trailLength = Math.min(this.velocity * 15, 30);
      const gradient = ctx.createLinearGradient(0, 0, -trailLength, 0);
      gradient.addColorStop(0, this.color + '80'); // Semi-transparent
      gradient.addColorStop(1, this.color + '00'); // Fully transparent
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-this.size * 0.5, 0);
      ctx.lineTo(-trailLength, 0);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  getPosition(): Vector2D {
    return { ...this.position };
  }

  getHeading(): number {
    return this.heading;
  }

  getVelocity(): number {
    return this.velocity;
  }

  getSize(): number {
    return this.size;
  }

  reset(position?: Vector2D, heading?: number): void {
    if (position) {
      this.position = { ...position };
    }
    if (heading !== undefined) {
      this.heading = heading;
    }
    this.velocity = 0;
  }
}
