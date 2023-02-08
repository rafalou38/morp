/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { CustomEase, map, randRange, Vector2 } from '$lib/utils/math';
import { mousPos, planToCanvas } from '$lib/utils/pixi';
import { Graphics, Container, Text, DisplayObject, Circle, Sprite, Application } from 'pixi.js';
import { DashLine } from 'pixi-dashed-line';
import { GRAY, GREEN, ownerMap, RED, WHITE, type Owner } from './utils';
import { Waiter } from '$lib/utils/time';
import { Troop } from './Troop';
import { get } from 'svelte/store';
import { currentConnection } from '$lib/api/connection';

let canvasFactor = 1;
export class Blob {
	/**
	 * ##############################
	 * ##########   Game   ##########
	 * ##############################
	 */

	static canvasSize: number;
	static baseRadius = 0.3;
	static maxMultiplier = 1.5;
	static topCapacity = 100;
	static selecting = false;
	static blobs: Blob[] = [];
	static app: Application;
	static currentMoves: { from: Blob[]; to: Blob; type: Owner }[] = [];

	static Setup(app: Application) {
		this.app = app;
	}

	static loadScale(app: Application) {
		this.canvasSize = app.view.width;
		canvasFactor = ((1 / 10) * this.canvasSize) / window.devicePixelRatio;
	}

	static ValidateMove(target: Blob) {
		const from = Blob.blobs.filter((b) => b.selected);
		Blob.currentMoves.push({
			to: target,
			from: from,
			type: 'self',
		});
	}

	static growTimer = Waiter(1000);
	static moveTimer = Waiter(100);
	static GameTick() {
		if (this.growTimer()) {
			for (const blob of Blob.blobs) {
				if (blob.owner != 'clear') blob.grow();
			}
		}

		if (this.moveTimer()) {
			// For each move
			for (let i = Blob.currentMoves.length - 1; i >= 0; i--) {
				const move = Blob.currentMoves[i];
				const target = move.to;

				// For each giver
				for (let j = move.from.length - 1; j >= 0; j--) {
					const giver = move.from[j];
					if (giver == target || giver.owner != move.type) continue;

					if (giver.troops > 0) {
						// Spawn a troop
						const max = 4;

						if (giver.troops >= max) {
							giver.troops -= max;
							for (let tIndex = 0; tIndex < max; tIndex++) {
								new Troop(giver, target);
							}
						} else {
							while (giver.troops > 0) {
								new Troop(giver, target);
								giver.troops--;
							}
						}
						giver.sendUpdate();
					} else {
						console.log('Removed');
						move.from.splice(j, 1);
					}
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
	id: number;
	pos: Vector2;
	troops: number;
	owner: 'self' | 'other' | 'clear';
	selected = false; // arrow pointing;

	// DISPLAY
	container: Container;
	hovered = false;
	private label: Text;
	private graphic: Graphics;
	constructor(x: number, y: number, owner: Owner, troops?: number, id?: number) {
		this.id = id || Math.random();
		this.pos = new Vector2(x, y);
		this.owner = owner;

		if (troops) {
			this.troops = troops;
		} else if (owner == 'clear') {
			this.troops = Math.round(randRange(10, 20));
		} else {
			this.troops = 10;
		}

		this.build();

		Blob.blobs.push(this);
	}

	register(stage: Container<DisplayObject>) {
		this.build();
		stage.addChild(this.container);

		return this;
	}

	grow() {
		if (this.owner == 'self') {
			if (this.troops < Blob.topCapacity) {
				this.troops++;
			} else if (this.troops > Blob.topCapacity) {
				this.troops--;
			}

			this.sendUpdate();
		}
	}

	receive(troop: Troop) {
		if (this.owner == troop.owner) {
			this.troops++;
		} else {
			this.troops--;
			if (this.troops < 0) {
				this.troops *= -1;
				this.owner = troop.owner;

				// // Changed owner, stop transfer
				// Blob.currentMoves = Blob.currentMoves.filter((m) => !m.from.includes(this));
			}
		}

		this.sendUpdate();
	}

	sendUpdate() {
		get(currentConnection)?.send({
			type: 'capture.blobUpdate',
			id: this.id,
			owner: ownerMap.get(this.owner),
			troop: this.troops,
		});
	}

	mirror() {
		const topLeft = new Vector2(0, 0);
		const topRight = new Vector2(10, 0);
		const bottomLeft = new Vector2(0, 10);
		const bottomRight = new Vector2(10, 10);

		const m1 = this.pos.sym(topLeft, bottomRight);
		const m2 = this.pos.sym(topRight, bottomLeft);
		const m3 = m2.sym(topLeft, bottomRight);

		return [
			new Blob(m1.x, m1.y, this.owner, this.troops),
			new Blob(m2.x, m2.y, this.owner, this.troops),
			new Blob(m3.x, m3.y, this.owner, this.troops),
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
		this.container.x = this.pos.x * canvasFactor;
		this.container.y = this.pos.y * canvasFactor;

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
			fontSize: Blob.baseRadius * canvasFactor * SHARP_TEXT_FACTOR,
			// stroke: '#fff',
			// strokeThickness: 2
		});
		this.label.scale.set(1 / SHARP_TEXT_FACTOR);

		this.container.addChild(this.label);

		this.reBuild();
	}
	reBuild(mouse?: Vector2) {
		this.container.x = this.pos.x * canvasFactor;
		this.container.y = this.pos.y * canvasFactor;

		// SHAPE
		const scale = CustomEase(
			1 - (Blob.topCapacity - Math.min(this.troops, Blob.topCapacity)) / Blob.topCapacity
		);
		let radiusPX = Blob.baseRadius * ((1.5 - 1) * scale + 1) * canvasFactor;
		this.graphic.clear();

		if (this.owner == 'clear') {
			if (this.hovered) {
				this.graphic.beginFill(GRAY);
				this.graphic.drawCircle(0, 0, radiusPX);
				this.label.style.fill = WHITE;
			} else {
				const dash = new DashLine(this.graphic, {
					dash: [0.15 * canvasFactor, 0.05 * canvasFactor],
					width: 0.025 * canvasFactor,
					color: GRAY,
				});
				this.label.style.fill = GRAY;
				dash.drawCircle(0, 0, radiusPX);
			}
		} else {
			if (this.owner == 'self') {
				if (this.hovered) radiusPX *= 1.1;
				this.graphic.beginFill(get(currentConnection)?.isHost ? GREEN : RED);
			} else if (this.owner == 'other')
				this.graphic.beginFill(get(currentConnection)?.isHost ? RED : GREEN);

			this.label.style.fill = WHITE;
			this.graphic.drawCircle(0, 0, radiusPX);
		}

		this.graphic.hitArea = new Circle(0, 0, radiusPX);
		this.graphic.endFill();

		// TEXT
		this.label.style.fontSize = Blob.baseRadius * canvasFactor * 2;
		this.label.text = this.troops.toString();
		this.label.x = -this.label.width / 2;
		this.label.y = -this.label.height / 2;

		// MOVE LINE
		if (this.selected && mouse) {
			const tx = mouse.x - this.container.x;
			const ty = mouse.y - this.container.y;
			this.graphic.moveTo(0, 0);
			const line = new DashLine(this.graphic, {
				dash: [0.15 * canvasFactor, 0.05 * canvasFactor],
				width: 0.025 * canvasFactor,
				color: get(currentConnection)?.isHost ? GREEN : RED,
			});
			this.graphic.beginFill(get(currentConnection)?.isHost ? GREEN : RED);
			this.graphic.drawCircle(tx, ty, 4);

			line.lineTo(tx, ty);

			this.graphic.endFill();
		}
	}

	destroy() {
		this.container?.parent?.removeChild(this.container);
		Blob.blobs = Blob.blobs.filter((t) => t != this);
	}
}
