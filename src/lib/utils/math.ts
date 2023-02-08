/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function clamp(input: number, min: number, max: number): number {
	return input < min ? min : input > max ? max : input;
}
export function map(
	current: number,
	in_min: number,
	in_max: number,
	out_min: number,
	out_max: number
): number {
	const mapped: number = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
	return clamp(mapped, out_min, out_max);
}
export const sq = (n) => Math.pow(n, 2);
export function CustomEase(x: number) {
	return 0.9 * x * (2.1 - x);
}

export function randRange(a: number, b: number) {
	return Math.random() * (b - a) + a;
}

export class Vector2 {
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	dot(v: Vector2): number {
		return this.x * v.x + this.y * v.y;
	}
	scale(k: number): Vector2 {
		return new Vector2(this.x * k, this.y * k);
	}
	add(v: Vector2) {
		this.x += v.x;
		this.y += v.y;
	}

	norm() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}

	angle(v: Vector2): number {
		// console.log(this.dot(v), this.norm(), v.norm(), this.dot(v) / (this.norm() * v.norm()));

		return Math.acos(this.dot(v) / (this.norm() * v.norm()));
	}

	to(v: Vector2) {
		return new Vector2(v.x - this.x, v.y - this.y);
	}

	sym(A: Vector2, B: Vector2) {
		const aTOm = A.to(this);
		const axis = A.to(B);

		const angle = aTOm.angle(axis);

		const ap = Math.cos(angle) * aTOm.norm();
		const P = new Vector2(A.x + axis.x * (ap / axis.norm()), A.y + axis.y * (ap / axis.norm()));

		return new Vector2(P.x - P.to(this).x, P.y - P.to(this).y);
	}
	copy() {
		return new Vector2(this.x, this.y);
	}
}
