export interface Position {
    x: number;
    y: number;
}

export interface Velocity {
    dx: number;
    dy: number;
}

export interface Drawable {
    position: Position;
    draw(): void;
}
