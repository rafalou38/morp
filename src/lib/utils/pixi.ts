import type { Application } from 'pixi.js';
import { check } from './assert';
import { Vector2 } from './math';

export function mousPos(app: Application): Vector2 {
	const pos = (app?.renderer.events as any).rootPointerEvent.global;
	return new Vector2(pos.x, pos.y);
}
