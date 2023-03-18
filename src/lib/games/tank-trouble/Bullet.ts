import { Vector2 } from "$lib/utils/math";
import { get } from "svelte/store";
import { app, engine } from "./Stores";
import { check } from "$lib/utils/assert";
import { Graphics, Texture } from "pixi.js";
import { Bodies, Body, Composite, Vector } from "matter-js";

import { Emitter, upgradeConfig } from '@pixi/particle-emitter'
import burstConfig from "$lib/configs/pixi/particles/emitter"



export class Bullet {
    static bullets: Bullet[] = [];
    static reDraw(dt: number) {
        this.bullets.forEach(b => b.reDraw(dt));
    }
    body: Body;
    gr: Graphics;
    speed: number;
    born: number;
    emitter: Emitter;
    constructor(pos: Vector2, dir: Vector2, speed: number) {
        const grStage = get(app)?.stage;
        const world = get(engine)?.world;
        check(grStage);
        check(world);

        this.emitter = new Emitter(grStage, upgradeConfig(burstConfig, [Texture.from("/images/particles/smoke.png")]));
        this.born = Date.now();

        this.speed = speed;

        this.gr = new Graphics();
        grStage.addChild(this.gr);


        this.gr.beginFill(0xffeeee);
        this.gr.drawCircle(0, 0, 5);
        this.gr.endFill();

        this.gr.position.set(pos.x, pos.y);


        this.body = Bodies.circle(pos.x, pos.y, 5, {
            frictionAir: 0,
            friction: 0,
            frictionStatic: 1,
            inertia: Infinity,
            restitution: 1,
            label: "bullet"
        });

        Composite.add(world, this.body);
        dir.setNorm(this.speed);
        // console.log(dir);


        // Body.applyForce(this.body, pos, dir);
        Body.setVelocity(this.body, dir);
        // this.setSpeed();

        Bullet.bullets.push(this);
    }

    private setSpeed() {
        const nv = Vector2.from(this.body.velocity).setNorm(this.speed);
        Body.setVelocity(this.body, nv);
    }

    destroy() {
        const grStage = get(app)?.stage;
        const world = get(engine)?.world;
        check(grStage);
        check(world);

        this.emitter.updateSpawnPos(this.body.position.x, this.body.position.y);
        this.emitter.playOnceAndDestroy(() => {
            Bullet.bullets = Bullet.bullets.filter(b => b != this);
        })

        this.died = true
        Composite.remove(world, this.body);
        grStage.removeChild(this.gr);
    }
    died = false;
    reDraw(dt: number) {
        this.emitter.update(dt);
        if (this.died) return;

        if (Date.now() - this.born > 1000 * 10) {
            this.destroy();
            return;
        }
        this.setSpeed();

        this.gr.position.set(this.body.position.x, this.body.position.y);
    }
}