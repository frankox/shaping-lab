import { Position, Drawable } from './types.js';

export abstract class StaticObject implements Drawable {
    public position: Position;
    protected size: number;
    protected color: string;
    public readonly type: string;
    public readonly id: number;

    constructor(x: number, y: number, size: number, color: string, type: string, id: number) {
        this.position = { x, y };
        this.size = size;
        this.color = color;
        this.type = type;
        this.id = id;
    }

    abstract draw(): void;
    
    public getSize(): number {
        return this.size;
    }
    
    public getType(): string {
        return this.type;
    }
    
    public getBoundingRadius(): number {
        return this.size / 2;
    }
}

export class Circle extends StaticObject {
    constructor(x: number, y: number, size: number) {
        super(x, y, size, '#3742fa', 'circle', 0);
    }

    public draw(): void {
        fill(this.color);
        stroke(255);
        strokeWeight(3);
        circle(this.position.x, this.position.y, this.size);
    }
}

export class Square extends StaticObject {
    constructor(x: number, y: number, size: number) {
        super(x, y, size, '#2ed573', 'square', 1);
    }

    public draw(): void {
        fill(this.color);
        stroke(255);
        strokeWeight(3);
        rectMode(CENTER);
        square(this.position.x, this.position.y, this.size);
    }
}

export class Diamond extends StaticObject {
    constructor(x: number, y: number, size: number) {
        super(x, y, size, '#ffa502', 'diamond', 2);
    }

    public draw(): void {
        fill(this.color);
        stroke(255);
        strokeWeight(3);
        
        const halfSize = this.size / 2;
        
        beginShape();
        vertex(this.position.x, this.position.y - halfSize); // Top
        vertex(this.position.x + halfSize, this.position.y); // Right
        vertex(this.position.x, this.position.y + halfSize); // Bottom
        vertex(this.position.x - halfSize, this.position.y); // Left
        endShape(CLOSE);
    }
}
