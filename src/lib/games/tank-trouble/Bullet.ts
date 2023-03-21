import { Vector2 } from "$lib/utils/math";
import { get } from "svelte/store";
import { app, engine, factor } from "./Stores";
import { check } from "$lib/utils/assert";
import { Graphics, Texture } from "pixi.js";
import { Bodies, Body, Composite, Events, Vector } from "matter-js";

import { Emitter, upgradeConfig } from '@pixi/particle-emitter'
import burstConfig from "$lib/configs/pixi/particles/emitter"
import { Sound } from "@pixi/sound";
import { currentConnection } from "$lib/api/connection";



export class Bullet {
    static sounds: { bounce: Sound; fade: Sound; };
    static loadSounds() {
        this.sounds = {
            bounce: Sound.from("/audios/hit.wav"),
            fade: Sound.from("/audios/poof-in-cloud.mp3"),
        }

        this.sounds.bounce.volume = 0.5;
        this.sounds.fade.volume = 0.7;
    }
    static bullets: Bullet[] = [];
    static reDraw(dt: number) {
        this.bullets.forEach(b => b.reDraw(dt));
    }

    static reset() {
        this.bullets.forEach(b => b.destroy(true));
    }


    body: Body;
    gr: Graphics;
    speed: number;
    born: number;
    emitter: Emitter;
    constructor(pos: Vector2, dir: Vector2, speed: number, remote = false) {
        const grStage = get(app)?.stage;
        const eng = get(engine);
        check(grStage);
        check(eng);
        const world = eng?.world;

        this.emitter = new Emitter(grStage, upgradeConfig(burstConfig(), [Texture.from("/images/particles/smoke.png")]));
        this.born = Date.now();

        this.speed = speed;

        this.gr = new Graphics();
        grStage.addChild(this.gr);


        this.gr.beginFill(0xffeeee);
        this.gr.drawCircle(0, 0, 0.5 * get(factor));
        this.gr.endFill();


        this.body = Bodies.circle(pos.x, pos.y, 0.5, {
            friction: 0,
            frictionAir: 0,
            restitution: 1,
            label: "bullet"
        });

        Events.on(eng, "collisionStart", (ev) => {
            const pair = ev.pairs[0];
            if ((pair.bodyA == this.body || pair.bodyB == this.body)) {
                Bullet.sounds.bounce.play();
            }
        })


        Composite.add(world, this.body);
        dir = dir.setNorm(this.speed / 10);

        Body.setVelocity(this.body, dir);
        this.setSpeed();

        Bullet.bullets.push(this);

        if (!remote)
            get(currentConnection)?.send({ type: "tank-trouble.bullet", pos, dir, speed })
    }

    private setSpeed() {
        const nv = Vector2.from(this.body.velocity).setNorm(this.speed / 10);
        Body.setVelocity(this.body, nv);
    }

    destroy(hit = false) {
        const grStage = get(app)?.stage;
        const world = get(engine)?.world;
        check(grStage);
        check(world);


        if (!hit) {
            this.emitter.updateSpawnPos(this.body.position.x * get(factor), this.body.position.y * get(factor));
            this.emitter.playOnceAndDestroy(() => {
                Bullet.bullets = Bullet.bullets.filter(b => b != this);
            })

            Bullet.sounds.fade.play();
        }

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

        this.gr.position.set(this.body.position.x * get(factor), this.body.position.y * get(factor));
    }
}