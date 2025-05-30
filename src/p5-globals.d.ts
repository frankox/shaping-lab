// Global p5.js type declarations
declare function createCanvas(width: number, height: number): any;
declare function fill(r: number, g?: number, b?: number, a?: number): void;
declare function fill(color: string): void;
declare function stroke(r: number, g?: number, b?: number, a?: number): void;
declare function stroke(color: string): void;
declare function strokeWeight(weight: number): void;
declare function noStroke(): void;
declare function circle(x: number, y: number, diameter: number): void;
declare function line(x1: number, y1: number, x2: number, y2: number): void;
declare function rect(x: number, y: number, width: number, height: number, radius?: number): void;
declare function square(x: number, y: number, size: number): void;
declare function text(str: string, x: number, y: number): void;
declare function textSize(size: number): void;
declare function textAlign(horizontal: string): void;
declare function map(value: number, start1: number, stop1: number, start2: number, stop2: number): number;
declare function lerpColor(c1: any, c2: any, amount: number): any;
declare function color(r: number, g: number, b: number): any;
declare function beginShape(): void;
declare function endShape(mode?: string): void;
declare function vertex(x: number, y: number): void;
declare function rectMode(mode: string): void;

// p5.js constants
declare const LEFT: string;
declare const CENTER: string;
declare const CLOSE: string;
