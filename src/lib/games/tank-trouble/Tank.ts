import { DEG_TO_RAD, Sprite, TilingSprite } from "pixi.js";
import type { Owner } from "../capture/utils";
import { app, engine } from "./Stores";
import { get } from "svelte/store";
import { pressedKeys } from "$lib/utils/input";
import { Vector2 } from "$lib/utils/math";
import { Bullet } from "./Bullet";
import Matter, { Bodies, Body, Composite, Detector, Events, World } from "matter-js";
import { check } from "$lib/utils/assert";
import { Emitter } from "@pixi/particle-emitter";
import explosion from "$lib/configs/pixi/particles/explosion";


const TANK_SPEED = 2.75;
const AMMO_SPEED = 3.5;
const turnSpeed = 3;

const RELOAD_DELAY = 3;
const MAX_AMMO = 4;


export class Tank {
    owner: string;

    sprite: Sprite;
    body: Body;
    ammo = MAX_AMMO;
    emitter: Emitter;
    realoadTimout: NodeJS.Timeout | null;
    constructor(x: number, y: number, size: number, owner: Owner) {
        const appT = get(app);
        const engT = get(engine);
        check(appT, "App should be valid (tank)");
        check(engT, "Engine should be valid (tank)");
        this.owner = owner;

        if (owner == "self") {
            this.sprite = Sprite.from("/images/tank.png");
        } else {
            this.sprite = Sprite.from("/images/tank-red.png");
        }
        this.sprite.anchor.set(0.5);
        this.sprite.height = size / 2;
        this.sprite.width = size / 2;
        this.sprite.position.set(x, y);

        appT.stage.addChild(this.sprite);

        this.emitter = new Emitter(appT.stage, explosion(owner == "self" ? "blue" : "red"));

        Events.on(engT, "collisionStart", (ev) => {
            const pair = ev.pairs[0];
            if ((pair.bodyA.label == "tank-" + owner && pair.bodyB.label == "bullet") || (pair.bodyB.label == "tank-" + owner && pair.bodyA.label == "bullet")) {
                console.log("DIE");

                this.destroy();


                Composite.remove(engT.world, pair.bodyA);
                pair.bodyA.position.x = 10000;
                Composite.remove(engT.world, pair.bodyB);
                pair.bodyB.position.x = 10000;
            }
        })

        this.body = Bodies.rectangle(this.sprite.position.x - this.sprite.width / 4, this.sprite.position.y - this.sprite.height / 4, this.sprite.width, this.sprite.height, { restitution: 0, friction: 0, frictionAir: 0.1, label: "tank-" + owner })
        const world = get(engine)?.world;
        check(world)
        Composite.add(world, this.body);
    }

    destroy() {
        this.emitter.spawnPos.set(this.body.position.x, this.body.position.y)
        this.emitter.autoUpdate = true;
    }

    shoot(dir: Vector2) {
        if (this.ammo <= 0) {
            this.realoadTimout ||= setTimeout(() => {
                this.realoadTimout = null;
                this.ammo = MAX_AMMO;
            }, RELOAD_DELAY * 1000)
            return
        };

        this.ammo--;
        new Bullet(
            Vector2.from(this.body.position).add(dir.setNorm(this.sprite.width * 0.6)),
            dir,
            AMMO_SPEED
        );
    }

    update() {
        /**
         * INPUT
         */
        if (pressedKeys.has("d")) {
            Body.setAngle(this.body, this.body.angle + turnSpeed * DEG_TO_RAD)
        }
        if (pressedKeys.has("q")) {
            Body.setAngle(this.body, this.body.angle - turnSpeed * DEG_TO_RAD)
        }

        const movement = new Vector2(Math.cos((this.body.angle - Math.PI / 2)), Math.sin((this.body.angle - Math.PI / 2)))
        movement.setNorm(TANK_SPEED / 1000);
        if (pressedKeys.has("z")) {
            Body.applyForce(this.body, this.body.position, movement);
        }
        if (pressedKeys.has("s")) {
            Body.applyForce(this.body, this.body.position, movement.scale(-1));
        }


        if (pressedKeys.has(" ")) {
            pressedKeys.delete(" ");
            this.shoot(movement);
        }

        this.sprite.position.set(this.body.position.x, this.body.position.y);
        this.sprite.rotation = this.body.angle;
    }
}