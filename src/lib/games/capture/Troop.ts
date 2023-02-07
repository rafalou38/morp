import type { Vector2 } from '$lib/utils/math';
import {
	Application,
	Graphics,
	ParticleContainer,
	RenderTexture,
	Sprite,
	type Container,
} from 'pixi.js';
import { Blob } from './Blob';
import { GRAY, GREEN, RED, WHITE, type Owner } from './utils';

let canvasFactor = 1;
export class Troop {
	static container: ParticleContainer;
	static grSelf: RenderTexture;
	static grOther: RenderTexture;
	static troops: Troop[] = [];
	static Setup(app: Application) {
		this.container = new ParticleContainer(100_000);
		app.stage.addChild(this.container);
		const gr = new Graphics();

		gr.clear();
		gr.beginFill(GREEN);
		gr.drawCircle(0, 0, 4);
		this.grSelf = app.renderer.generateTexture(gr);

		gr.clear();
		gr.beginFill(RED);
		gr.drawCircle(0, 0, 4);
		this.grOther = app.renderer.generateTexture(gr);

		canvasFactor = (1 / 10) * app.view.width;
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

	pos: Vector2;
	sprite: Sprite;
	owner: Owner;

	target: Blob;

	constructor(pos: Vector2, target: Blob, owner: Owner) {
		console.log(pos);

		this.pos = pos;
		this.owner = owner;
		this.target = target;

		if (owner === 'other') this.sprite = new Sprite(Troop.grOther);
		else this.sprite = new Sprite(Troop.grSelf);

		Troop.container.addChild(this.sprite);
		Troop.troops.push(this);
	}

	update(dt: number) {
		const between = this.pos.to(this.target.pos);
		const movement = between.scale(1 / between.norm()).scale(dt / 700);
		this.pos.add(movement);

		if (this.target.pos.to(this.pos).norm() < Blob.baseRadius) {
			// Calculate impact
			// console.log(this.pos);
			this.target.receive(this);

			this.destroy();
		}

		// console.log(this.pos);

		// this.pos.x +=
	}

	draw() {
		this.sprite.position.set(this.pos.x * canvasFactor, this.pos.y * canvasFactor);
	}

	destroy() {
		Troop.troops = Troop.troops.filter((t) => t != this);
		Troop.container.removeChild(this.sprite);
	}
}
