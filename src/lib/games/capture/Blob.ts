/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { map, Vector2 } from '$lib/utils/math';
import { mousPos } from '$lib/utils/pixi';
import { Graphics, Container, Text, DisplayObject } from 'pixi.js';

type Owner = 'self' | 'other' | 'clear';
export class Blob {
	static baseRadius: number;
	static maxMultiplier = 1.5;

	static Configure(width: number) {
		Blob.baseRadius = Math.min((width * 0.8) / 20, 25);
	}

	// SETTINGS
	pos: Vector2;
	troops: number;
	owner: 'self' | 'other' | 'clear';

	// DISPLAY
	container: Container;
	private label: Text;
	private graphic: Graphics;
	constructor(x: number, y: number, owner: Owner, troops?: number) {
		this.pos = new Vector2(x, y);
		this.owner = owner;

		if (troops) {
			this.troops = troops;
		} else if (owner == 'clear') {
			this.troops = Math.round(Math.random() * 10);
		} else {
			this.troops = 10;
		}

		this.build();
	}

	register(stage: Container<DisplayObject>) {
		stage.addChild(this.container);
	}

	grow() {
		this.troops++;
		this.reBuild();
	}

	mirror(w: number, h: number) {
		const topLeft = new Vector2(0, 0);
		const topRight = new Vector2(w, 0);
		const bottomLeft = new Vector2(0, h);
		const bottomRight = new Vector2(w, h);

		const m1 = this.pos.sym(topLeft, bottomRight);
		const m2 = this.pos.sym(topRight, bottomLeft);
		const m3 = m2.sym(topLeft, bottomRight);

		return [
			new Blob(m1.x, m1.y, this.owner, this.troops),
			new Blob(m2.x, m2.y, this.owner, this.troops),
			new Blob(m3.x, m3.y, this.owner, this.troops)
		];
	}
	overlaps(other: Blob) {
		return this.pos.to(other.pos).norm() < Blob.baseRadius * (Blob.maxMultiplier * 2);
	}
	private reBuild() {
		if (this.owner == 'self') this.graphic.beginFill(0x2ecc71);
		else if (this.owner == 'other') this.graphic.beginFill(0xe74c3c);
		else if (this.owner == 'clear') this.graphic.beginFill(0xbdc3c7);

		this.graphic.drawCircle(0, 0, Blob.baseRadius * 1.5);

		this.label.text = this.troops.toString();
		this.label.x = -this.label.width / 2;
		this.label.y = -this.label.height / 2;
	}
	private build() {
		this.container = new Container();
		this.container.x = this.pos.x;
		this.container.y = this.pos.y;

		this.graphic = new Graphics();
		this.label = new Text(this.troops.toString(), {
			fontFamily: 'Arial',
			fill: ['#fff'],
			fontSize: Blob.baseRadius
		});

		this.container.addChild(this.graphic);
		this.container.addChild(this.label);

		this.reBuild();
	}
}
