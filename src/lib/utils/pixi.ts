import type { Application } from 'pixi.js';
import { writable } from 'svelte/store';
import { check } from './assert';
import { Vector2 } from './math';

export function mousPos(app: Application): Vector2 {
	const pos = (app?.renderer.events as any).rootPointerEvent.global;
	return new Vector2(pos.x, pos.y);
}

export function planToCanvas(sz: number, pos: Vector2) {
	return new Vector2(
		(pos.x / 10) * sz, //
		(pos.y / 10) * sz
	);
}

export const canvasRatio = writable(1);
export const canvasSize = writable(1);
