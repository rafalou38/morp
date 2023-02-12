import { currentConnection } from '$lib/api/connection';
import { Vector2 } from '$lib/utils/math';
import {
	Application,
	Graphics,
	ParticleContainer,
	RenderTexture,
	Sprite,
	type Container,
} from 'pixi.js';
import { get } from 'svelte/store';
import { Blob } from './Blob';
import { GRAY, GREEN, ownerMap, RED, WHITE, type Owner } from './utils';

let canvasFactor = 1;
const baseRadius = 0.05;
let grSelf: RenderTexture;
let grOther: RenderTexture;
export class Troop {
	static otherContainer: ParticleContainer;
	static selfContainer: ParticleContainer;
	static troops: Troop[] = [];
	static troopsMap: Map<number, Troop> = new Map();
	static app: Application;

	static Setup(app: Application) {
		this.app = app;

		this.selfContainer = this.selfContainer || new ParticleContainer(100_000);
		this.otherContainer = this.otherContainer || new ParticleContainer(100_000);

		app.stage.addChild(this.selfContainer);
		app.stage.addChild(this.otherContainer);
	}

	static loadScale(app: Application) {
		canvasFactor = ((1 / 10) * app.view.width) / window.devicePixelRatio;
		const gr = new Graphics();

		gr.clear();
		gr.beginFill(get(currentConnection)?.isHost ? GREEN : RED);
		gr.drawCircle(0, 0, baseRadius * canvasFactor);
		gr.endFill();
		grSelf = this.app.renderer.generateTexture(gr);

		gr.clear();
		gr.beginFill(get(currentConnection)?.isHost ? RED : GREEN);
		gr.drawCircle(0, 0, baseRadius * canvasFactor);
		gr.endFill();
		grOther = this.app.renderer.generateTexture(gr);
	}

	static Update(dt: number) {
		for (const troop of this.troops) {
			troop.update(dt);
		}
	}

	static Draw() {
		for (const troop of this.troops) {
			troop.draw();
		}
	}

	id: number;

	pos: Vector2;
	sprite: Sprite;
	owner: Owner;
	destroyed = false;

	target: Blob;
	remote: boolean;

	constructor(origin: Blob, target: Blob, remote = false, pos?: Vector2, id?: number) {
		this.id = id || Math.random();
		Troop.troopsMap.set(this.id, this);
		this.remote = remote;
		if (pos) {
			this.pos = pos.sym(new Vector2(0, 10), new Vector2(10, 0));
		} else {
			this.pos = origin.pos.copy();
			this.pos.x += Math.random() * Blob.baseRadius - Blob.baseRadius;
			this.pos.y += Math.random() * Blob.baseRadius - Blob.baseRadius;
		}
		this.owner = origin.owner;
		this.target = target;

		if (this.owner === 'other') {
			this.sprite = new Sprite(grOther);
			Troop.otherContainer.addChild(this.sprite);
		} else {
			this.sprite = new Sprite(grSelf);
			Troop.selfContainer.addChild(this.sprite);
		}

		Troop.troops.push(this);

		if (!remote)
			get(currentConnection)?.send({
				type: 'capture.troopSpawn',
				troopData: {
					x: this.pos.x,
					y: this.pos.y,
					targetID: target.id,
					originID: origin.id,
					// id: this.id,
				},
			});
	}

	update(dt: number) {
		if (this.destroyed) return;
		const between = this.pos.to(this.target.pos);
		const movement = between.scale(1 / between.norm()).scale(dt / 1000);
		this.pos.add(movement);

		if (this.target.pos.to(this.pos).norm() < Blob.baseRadius) {
			// Calculate impact
			if (!this.remote) this.target.receive(this);
			this.destroy();
		}

		if (this.owner == 'self') {
			const destroyed = new Set<number>();
			for (const other of Troop.troops) {
				if (other.owner != this.owner && !other.destroyed && !this.destroyed) {
					const dist = this.pos.to(other.pos).norm();

					if (dist < baseRadius * 2) {
						this.destroyed = true;
						other.destroyed = true;
						destroyed.add(this.id);
						destroyed.add(other.id);
					}
				}
			}

			destroyed.forEach((d) => Troop.troopsMap.get(d)?.destroy());
		}
	}

	draw() {
		if (this.destroyed) return;

		if (this.owner === 'other') this.sprite.texture = grOther;
		else this.sprite.texture = grSelf;

		this.sprite.position.set(this.pos.x * canvasFactor, this.pos.y * canvasFactor);
	}

	destroy() {
		this.destroyed = true;
		Troop.troops = Troop.troops.filter((t) => t != this);
		if (this.owner === 'other') {
			Troop.otherContainer.removeChild(this.sprite);
		} else {
			Troop.selfContainer.removeChild(this.sprite);
		}
	}
}
