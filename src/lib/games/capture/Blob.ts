/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CustomEase, map, Vector2 } from '$lib/utils/math';
import { mousPos } from '$lib/utils/pixi';
import { Graphics, Container, Text, DisplayObject, Circle, Sprite, Application } from 'pixi.js';
import { DashLine } from 'pixi-dashed-line';

type Owner = 'self' | 'other' | 'clear';
export class Blob {
	/**
	 * ##############################
	 * ##########   Game   ##########
	 * ##############################
	 */

	static baseRadius: number;
	static maxMultiplier = 1.5;
	static topCapacity = 100;
	static selecting = false;
	static blobs: Blob[] = [];
	static app: Application;
	static currentMoves: { from: Blob[]; to: Blob }[] = [];

	static Configure(app: Application) {
		Blob.baseRadius = Math.min((app.view.width * 0.8) / 20, 25);
		this.app = app;
	}

	static ValidateMove(target: Blob) {
		Blob.currentMoves.push({
			to: target,
			from: Blob.blobs.filter((b) => b.selected)
		});
	}

	static GameTick() {
		for (let i = Blob.currentMoves.length - 1; i >= 0; i--) {
			const move = Blob.currentMoves[i];
			for (let j = move.from.length - 1; j >= 0; j--) {
				const giver = move.from[j];

				if (giver.troops > 0) {
					giver.troops--;
					if (move.to.owner == 'self') {
						move.to.troops++;
						if (move.to.troops >= Blob.topCapacity) {
							this.currentMoves.splice(i, 1);
							break;
						}
					} else {
						if (move.to.troops == 0) {
							move.to.owner = 'self';
							move.to.troops++;
						} else {
							move.to.troops--;
						}
					}
				} else {
					move.from.splice(j, 1);
				}
			}
		}
	}

	/**
	 * ##############################
	 * ########## INSTANCE ##########
	 * ##############################
	 */

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

		Blob.blobs.push(this);
	}

	register(stage: Container<DisplayObject>) {
		stage.addChild(this.container);
	}

	grow() {
		if (this.troops < Blob.topCapacity) {
			this.troops++;
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

	// EVENTS
	private handleMouseEnter() {
		this.hovered = true;
	}
	private handleMouseLeave() {
		this.hovered = false;
		if (Blob.selecting && this.owner == 'self') {
			this.selected = true;
		}
	}
	private handleMouseDown() {
		if (this.owner == 'self') {
			this.selected = true;
			Blob.selecting = true;
		}
	}
	private handleMouseUp() {
		Blob.ValidateMove(this);

		for (const blob of Blob.blobs) {
			blob.selected = false;
		}
		Blob.selecting = false;
	}
	private build() {
		this.container = new Container();
		this.container.x = this.pos.x;
		this.container.y = this.pos.y;

		this.graphic = new Graphics();

		this.graphic.interactive = true;
		this.graphic.on('mouseenter', this.handleMouseEnter.bind(this));
		this.graphic.on('mouseleave', this.handleMouseLeave.bind(this));
		this.graphic.on('mousedown', this.handleMouseDown.bind(this));
		this.graphic.on('mouseup', this.handleMouseUp.bind(this));

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
	reBuild(mouse?: Vector2) {
		const RED = 0xe74c3c;
		const GREEN = 0x2ecc71;
		const GRAY = 0xbdc3c7;
		const WHITE = 0xffffff;

		// SHAPE
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

			this.label.style.fill = WHITE;
			this.graphic.drawCircle(0, 0, radius);
		}

		this.graphic.hitArea = new Circle(0, 0, radius);

		// TEXT
		this.label.text = this.troops.toString();
		this.label.x = -this.label.width / 2;
		this.label.y = -this.label.height / 2;

		// MOVE LINE
		if (this.selected && mouse) {
			const tx = mouse.x - this.container.x;
			const ty = mouse.y - this.container.y;
			this.graphic.moveTo(0, 0);
			const line = new DashLine(this.graphic, {
				dash: [10, 2],
				width: 2,
				color: GREEN
			});
			this.graphic.beginFill(GREEN);
			this.graphic.drawCircle(tx, ty, 4);

			line.lineTo(tx, ty);
		}
	}
}
