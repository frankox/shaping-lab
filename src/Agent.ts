import { Vector2D, AgentState, NetworkOutput, NetworkInput, Shape } from './types';
import { normalizeAngle, clamp, distanceToShape } from './utils';

export class Agent {
  private position: Vector2D;
  private heading: number;
  private velocity: number;
  private maxSpeed: number = 0.1;
  private maxRotationSpeed: number = 0.08; 
  private size: number = 10;
  private color: string = '#E91E63';
  private angularVelocity: number = 0;

  constructor(
    initialPosition: Vector2D = { x: 100, y: 100 },
    initialHeading: number = 0
  ) {
    this.position = { ...initialPosition };
    this.heading = initialHeading;
    this.velocity = 0;
    this.angularVelocity = 0;
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
    
    // Use sine for heading to avoid boundary issues
    const headingSin = Math.sin(this.heading);
    
    // Normalize velocity to [0, 1] range
    const normalizedVelocity = this.velocity / this.maxSpeed;

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

  applyAction(output: NetworkOutput, deltaTime: number): void {
    // Apply rotation with smoother angular velocity
    const targetAngularVelocity = output.rotationDirection * output.rotationSpeed * this.maxRotationSpeed;
    
    // Smooth angular velocity interpolation for more natural movement
    const angularDamping = 0.8;
    this.angularVelocity = this.angularVelocity * angularDamping + targetAngularVelocity * (1 - angularDamping);
    
    const rotationAmount = this.angularVelocity * deltaTime * 60; // Normalize to 60fps
    this.heading = normalizeAngle(this.heading + rotationAmount);
    
    // Apply forward movement - allow true zero speed
    const targetVelocity = output.forwardSpeed * this.maxSpeed;
    
    // If target speed is very low, stop immediately to allow standing still
    if (targetVelocity < 0.01) {
      this.velocity = 0;
    } else {
      // Use less damping for more responsive speed changes
      const velocityDamping = 0.7; // Reduced from 0.9
      this.velocity = this.velocity * velocityDamping + targetVelocity * (1 - velocityDamping);
      
      // Minimum velocity threshold to avoid very slow drifting
      if (this.velocity < 0.005) {
        this.velocity = 0;
      }
    }
    
    // Update position only if velocity is above zero
    if (this.velocity > 0) {
      const deltaX = Math.cos(this.heading) * this.velocity * deltaTime * 60;
      const deltaY = Math.sin(this.heading) * this.velocity * deltaTime * 60;
      
      this.position.x += deltaX;
      this.position.y += deltaY;
    }
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
    
    // Change agent appearance based on speed
    const speedRatio = this.velocity / this.maxSpeed;
    const agentColor = speedRatio < 0.01 ? '#FF5722' : this.color; // Red when stopped
    const agentSize = this.size + (speedRatio * 3); // Slightly larger when moving fast
    
    // Draw agent body (circle) with smooth edges
    ctx.fillStyle = agentColor;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = speedRatio < 0.01 ? 2 : 1; // Thicker border when stopped
    ctx.beginPath();
    ctx.arc(0, 0, agentSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Draw direction indicator (small triangle pointing forward)
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = agentColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(agentSize * 0.7, 0);
    ctx.lineTo(agentSize * 0.3, -agentSize * 0.3);
    ctx.lineTo(agentSize * 0.3, agentSize * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Draw velocity indicator (trail) with more responsive feedback
    if (this.velocity > 0.005) { // Lower threshold to show more speed variations
      const trailLength = Math.min(this.velocity * 200, 50); // More pronounced trail
      const trailOpacity = Math.min(speedRatio * 2, 1); // More visible for higher speeds
      
      const gradient = ctx.createLinearGradient(0, 0, -trailLength, 0);
      gradient.addColorStop(0, agentColor + Math.floor(trailOpacity * 128).toString(16).padStart(2, '0'));
      gradient.addColorStop(1, agentColor + '00'); // Fully transparent
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2 + speedRatio * 3; // Thicker trail for higher speeds
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-agentSize * 0.5, 0);
      ctx.lineTo(-trailLength, 0);
      ctx.stroke();
    }
    
    // Draw speed indicator text when stopped
    if (speedRatio < 0.01) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('STOP', 0, agentSize + 15);
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
    this.angularVelocity = 0; // Reset angular velocity
  }
}
