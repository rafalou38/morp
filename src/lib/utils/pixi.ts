import type { Application } from 'pixi.js';
import { Vector2 } from './math';

export function mousPos(app: Application) {
	const pos = (app?.renderer.events as any).rootPointerEvent.global;
	return new Vector2(pos.x, pos.y);
}
