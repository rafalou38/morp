/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CustomEase, map, Vector2 } from '$lib/utils/math';
import { mousPos } from '$lib/utils/pixi';
import { Graphics, Container, Text, DisplayObject, Circle, Sprite } from 'pixi.js';
import { DashLine } from 'pixi-dashed-line';

type Owner = 'self' | 'other' | 'clear';
export class Blob {
	static baseRadius: number;
	static maxMultiplier = 1.5;
	static topCapacity = 100;

	static Configure(width: number) {
		Blob.baseRadius = Math.min((width * 0.8) / 20, 25);
	}

	// SETTINGS
	pos: Vector2;
	troops: number;
	owner: 'self' | 'other' | 'clear';
	selected = false; // arrow pointing;

	// DISPLAY
	container: Container;
	hovered = false;
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
		if (this.troops < Blob.topCapacity) {
			this.troops++;
			this.reBuild();
		}
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
		const RED = 0xe74c3c;
		const GREEN = 0x2ecc71;
		const GRAY = 0xbdc3c7;
		const WHITE = 0xffffff;
		const scale = CustomEase(
			1 - (Blob.topCapacity - Math.min(this.troops, Blob.topCapacity)) / Blob.topCapacity
		);
		let radius = Blob.baseRadius * ((1.5 - 1) * scale + 1);

		this.graphic.clear();

		if (this.owner == 'clear') {
			if (this.hovered) {
				this.graphic.beginFill(GRAY);
				this.graphic.drawCircle(0, 0, radius);
				this.label.style.fill = WHITE;
			} else {
				const dash = new DashLine(this.graphic, {
					dash: [10, 5],
					width: 2,
					color: GRAY
				});
				this.label.style.fill = GRAY;
				dash.drawCircle(0, 0, radius);
			}
		} else {
			if (this.owner == 'self') {
				if (this.hovered) radius *= 1.1;
				this.graphic.beginFill(GREEN);
			} else if (this.owner == 'other') this.graphic.beginFill(RED);

			this.graphic.drawCircle(0, 0, radius);
		}

		this.graphic.hitArea = new Circle(0, 0, radius);

		this.label.text = this.troops.toString();
		this.label.x = -this.label.width / 2;
		this.label.y = -this.label.height / 2;
	}
	private handleMouseEnter() {
		this.hovered = true;
		this.reBuild();
	}
	private handleMouseLeave() {
		this.hovered = false;
		this.reBuild();
	}
	private build() {
		this.container = new Container();
		this.container.x = this.pos.x;
		this.container.y = this.pos.y;

		this.graphic = new Graphics();

		this.graphic.interactive = true;
		this.graphic.on('mouseenter', this.handleMouseEnter.bind(this));
		this.graphic.on('mouseleave', this.handleMouseLeave.bind(this));

		this.container.addChild(this.graphic);

		const SHARP_TEXT_FACTOR = 2;
		this.label = new Text(this.troops.toString(), {
			fontFamily: 'Arial',
			fill: ['#fff'],
			fontSize: Blob.baseRadius * SHARP_TEXT_FACTOR
			// stroke: '#fff',
			// strokeThickness: 2
		});
		this.label.scale.set(1 / SHARP_TEXT_FACTOR);

		this.container.addChild(this.label);

		this.reBuild();
	}
}
