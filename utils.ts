import { createCanvas } from "canvas";

export class Vec2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  add(add: Vec2): Vec2;
  add(x: number, y: number): Vec2;
  add(arg1: Vec2 | number, arg2?: number): Vec2 {
    if (typeof arg1 == "number") return new Vec2(this.x + arg1, this.y + arg2!);
    else return new Vec2(this.x + arg1.x, this.y + arg1.y);
  }

  sub(sub: Vec2): Vec2 {
    return new Vec2(this.x - sub.x, this.y - sub.y);
  }

  mul(mul: number | Vec2): Vec2 {
    if (mul instanceof Vec2) {
      return new Vec2(this.x * mul.x, this.y * mul.y);
    } else {
      return new Vec2(this.x * mul, this.y * mul);
    }
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  asArray(): [number, number] {
    //spreadable
    return [this.x, this.y];
  }
  spreadable(): [number, number] {
    return [this.x, this.y];
  }

  static get zero(): Vec2 {
    return new Vec2(0, 0);
  }
  static get one(): Vec2 {
    return new Vec2(1, 1);
  }

  static at(x: number, y: number) {
    return new Vec2(x, y);
  }
  static of(x: number, y: number) {
    return new Vec2(x, y);
  }

  distance(other: Vec2): any {
    let diff = this.sub(other);
    return Math.sqrt(diff.x * diff.x + diff.y * diff.y);
  }
}
