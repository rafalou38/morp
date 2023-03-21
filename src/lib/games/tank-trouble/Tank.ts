import { DEG_TO_RAD, Sprite, TilingSprite } from "pixi.js";
import { Sound } from "@pixi/sound";
import type { Owner } from "../capture/utils";
import { app, engine, factor } from "./Stores";
import { get } from "svelte/store";
import { pressedKeys } from "$lib/utils/input";
import { Vector2 } from "$lib/utils/math";
import { Bullet } from "./Bullet";
import Matter, { Bodies, Body, Composite, Detector, Events, World } from "matter-js";
import { check } from "$lib/utils/assert";
import { Emitter } from "@pixi/particle-emitter";
import explosion from "$lib/configs/pixi/particles/explosion";
import { currentConnection } from "$lib/api/connection";


const TANK_SPEED = 4;
const AMMO_SPEED = 5;
const turnSpeed = 3;

const RELOAD_DELAY = 3;
const MAX_AMMO = 4;


export class Tank {
    static sounds: { shoot: Sound; destroy: Sound; ride: Sound; };
    static loadSounds() {
        this.sounds = {
            shoot: Sound.from("/audios/weapons/toy_cannon_shot.wav"),
            destroy: Sound.from("/audios/weapons/explosion1.wav"),
            ride: Sound.from("/audios/car.wav"),
        }

        this.sounds.shoot.volume = 0.5;
        this.sounds.destroy.volume = 0.1;
        this.sounds.ride.loop = true;
        this.sounds.ride.volume = 0;
    }

    owner: Owner;

    targetPosition: Vector2;
    targetAngle: number;
    initialPos: Vector2;
    sprite: Sprite;
    body: Body;
    ammo = MAX_AMMO;
    emitter: Emitter;
    realoadTimout: NodeJS.Timeout | null;
    alive = true;
    constructor(x: number, y: number, size: number, owner: Owner) {
        const appT = get(app);
        const engT = get(engine);
        check(appT, "App should be valid (tank)");
        check(engT, "Engine should be valid (tank)");
        this.owner = owner;
        this.initialPos = new Vector2(x, y);

        if (owner == "self") {
            this.sprite = Sprite.from("/images/tank.png");
        } else {
            this.sprite = Sprite.from("/images/tank-red.png");
        }
        this.sprite.anchor.set(0.5);
        this.sprite.height = (size / 2) * get(factor);
        this.sprite.width = (size / 2) * get(factor);

        appT.stage.addChild(this.sprite);

        this.emitter = new Emitter(appT.stage, explosion(owner == "self" ? "blue" : "red"));

        Events.on(engT, "collisionStart", (ev) => {
            const pair = ev.pairs[0];
            if ((pair.bodyA.label == "tank-" + owner && pair.bodyB.label == "bullet") || (pair.bodyB.label == "tank-" + owner && pair.bodyA.label == "bullet")) {
                console.log("DIE");

                this.destroy();

                const bullet = Bullet.bullets.find(b => b.body == pair.bodyA || b.body == pair.bodyB)
                if (bullet) {
                    bullet.destroy(true);
                }
            }
        })

        this.body = Bodies.rectangle(
            x, y,
            size / 2, size / 2,
            { restitution: 0, friction: 0, frictionAir: 0.1, label: "tank-" + owner })

        this.reset();
        const world = get(engine)?.world;
        check(world)
        Composite.add(world, this.body);
    }

    reset() {
        Body.setPosition(this.body, this.initialPos);
        Body.setAngle(this.body, 0);
        Body.setVelocity(this.body, new Vector2(0, 0));

        this.sprite.position.set(this.body.position.x * get(factor), this.body.position.y * get(factor));
        this.sprite.rotation = this.body.angle;
    }

    sendPos() {
        get(currentConnection)?.send({
            type: 'tank-trouble.position',
            pos: this.body.position,
            angle: this.body.angle,
        });
    }

    destroy() {
        const engT = get(engine);
        check(engT, "eng should be valid (tank)");

        Tank.sounds.destroy.play();
        // Composite.remove(engT.world, this.body);
        // this.sprite.parent.removeChild(this.sprite);
        this.emitter.spawnPos.set(this.body.position.x * get(factor), this.body.position.y * get(factor))
        this.emitter.autoUpdate = true;
        this.body.position.x = 1000;
        this.update();
        this.alive = false;
        Tank.sounds.ride.volume = 0;
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
        Tank.sounds.shoot.play();
        // this.body.
        Body.applyForce(this.body, this.body.position, dir.setNorm((-TANK_SPEED * 2) / 1000 / 1000))
        new Bullet(
            Vector2.from(this.body.position).add(dir.setNorm((this.sprite.height * 0.6) / get(factor))),
            dir,
            AMMO_SPEED
        );
    }

    update() {
        if (!this.alive) return;

        if (this.owner == "self") {
            const dPressed = pressedKeys.has("d");
            const aPressed = pressedKeys.has("a");
            const wPressed = pressedKeys.has("w");
            const sPressed = pressedKeys.has("s");
            /**
             * INPUT
             */
            if (dPressed) {
                Body.setAngle(this.body, this.body.angle + turnSpeed * DEG_TO_RAD)
            }
            if (aPressed) {
                Body.setAngle(this.body, this.body.angle - turnSpeed * DEG_TO_RAD)
            }

            let movement = new Vector2(Math.cos((this.body.angle - Math.PI / 2)), Math.sin((this.body.angle - Math.PI / 2)))
            movement = movement.setNorm(TANK_SPEED / 1000 / 1000);
            if (wPressed) {
                Body.applyForce(this.body, this.body.position, movement);
                // console.log(this.body.speed);
            }
            if (sPressed) {
                Body.applyForce(this.body, this.body.position, movement.scale(-1));
            }
            if (pressedKeys.has(" ")) {
                pressedKeys.delete(" ");
                this.shoot(movement);
            }

            if (dPressed || aPressed || wPressed || sPressed) this.sendPos();
        } else if (this.targetPosition) {
            Body.setPosition(this.body, Vector2.from(this.body.position).lerp(this.targetPosition, 0.25));
            Body.setAngle(this.body, this.body.angle + (this.targetAngle - this.body.angle) * 0.25);
        }


        if (!Tank.sounds.ride.isPlaying) {
            Tank.sounds.ride.play();
        }

        this.sprite.position.set(this.body.position.x * get(factor), this.body.position.y * get(factor));
        this.sprite.rotation = this.body.angle;
    }
}