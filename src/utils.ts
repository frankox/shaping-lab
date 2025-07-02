import { Vector2D, Shape } from './types';

export function distance(a: Vector2D, b: Vector2D): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function normalizeAngle(angle: number): number {
  return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function distanceToShape(position: Vector2D, shape: Shape): number {
  switch (shape.type) {
    case 'circle':
      return Math.max(0, distance(position, shape.position) - shape.size / 2);
    
    case 'square': {
      const dx = Math.max(0, Math.abs(position.x - shape.position.x) - shape.size / 2);
      const dy = Math.max(0, Math.abs(position.y - shape.position.y) - shape.size / 2);
      return Math.sqrt(dx * dx + dy * dy);
    }
    
    case 'triangle': {
      // Simplified distance to triangle center for now
      // In a more sophisticated implementation, we'd calculate actual distance to triangle edges
      return Math.max(0, distance(position, shape.position) - shape.size / 2);
    }
    
    default:
      return 0;
  }
}

export function isInsideShape(position: Vector2D, shape: Shape): boolean {
  return distanceToShape(position, shape) === 0;
}

export function generateGradientRewards(
  stateCount: number,
  minValue: number,
  maxValue: number
): number[] {
  if (stateCount === 0) return [];
  if (stateCount === 1) return [maxValue];
  
  const rewards: number[] = [];
  for (let i = 0; i < stateCount; i++) {
    // Exponential distribution: latest states get much higher rewards
    const t = i / (stateCount - 1);
    const exponentialT = Math.pow(t, 0.3); // Use smaller exponent for stronger effect on recent states
    rewards.push(lerp(minValue, maxValue, exponentialT));
  }
  return rewards;
}

export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.border = '1px solid #ccc';
  canvas.style.borderRadius = '8px';
  return canvas;
}

export function requestAnimationFrameAsync(): Promise<number> {
  return new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
}
