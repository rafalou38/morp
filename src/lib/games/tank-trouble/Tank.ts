import { DEG_TO_RAD, Sprite } from "pixi.js";
import type { Owner } from "../capture/utils";
import { app, engine } from "./Stores";
import { get } from "svelte/store";
import { pressedKeys } from "$lib/utils/input";
import { Vector2 } from "$lib/utils/math";
import { Bullet } from "./Bullet";
import { Bodies, Body, Composite } from "matter-js";
import { check } from "$lib/utils/assert";


const speed = 4;
const turnSpeed = 3;

export class Tank {
    owner: string;

    sprite: Sprite;
    body: Body;
    constructor(x: number, y: number, size: number, owner: Owner) {
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
        // this.sprite.rotation = this.direction;

        get(app)?.stage.addChild(this.sprite);


        this.body = Bodies.rectangle(this.sprite.position.x - this.sprite.width / 4, this.sprite.position.y - this.sprite.height / 4, this.sprite.width, this.sprite.height, { restitution: 0, friction: 0, frictionAir: 0.1 })
        const world = get(engine)?.world;
        check(world)
        Composite.add(world, this.body);
    }

    update() {

        /**
         * INPUT
         */
        if (pressedKeys.has("d")) {
            // this.direction += turnSpeed * DEG_TO_RAD;
            // this.body.angle += turnSpeed * DEG_TO_RAD
            // debugger
            Body.setAngle(this.body, this.body.angle + turnSpeed * DEG_TO_RAD)
            // const vel = Vector2.from(this.body.velocity);
            // const curspeed = vel.norm();

            // vel.x = Math.cos(this.body.angle)
            // vel.y = Math.sin(this.body.angle)
            // vel.setNorm(curspeed)

            // Body.setVelocity(this.body, vel)

            // console.log(vel);


        }
        if (pressedKeys.has("a")) {
            // this.direction += -turnSpeed * DEG_TO_RAD;
            // this.body.angle += turnSpeed * DEG_TO_RAD
            Body.setAngle(this.body, this.body.angle - turnSpeed * DEG_TO_RAD)
        }

        const movement = new Vector2(Math.cos((this.body.angle - Math.PI / 2)), Math.sin((this.body.angle - Math.PI / 2)))
        // console.log(movement);
        movement.setNorm(speed / 1000);

        if (pressedKeys.has(" ")) {
            pressedKeys.delete(" ");

            new Bullet(Vector2.from(this.body.position).add(movement.setNorm(this.sprite.width * 0.6)), movement, 5);
        }


        if (pressedKeys.has("w")) {
            // this.x += movement.x;
            // this.y += movement.y;
            // this.body
            Body.applyForce(this.body, this.body.position, movement);

            // this.direction += 1;
        }

        if (pressedKeys.has("s")) {
            Body.applyForce(this.body, this.body.position, movement.scale(-1));
            // this.x -= movement.x;
            // this.y -= movement.y;
            // this.direction += 1;
        }



        // this.sprite.position.set(this.x, this.y);
        this.sprite.position.set(this.body.position.x, this.body.position.y);
        this.sprite.rotation = this.body.angle;
    }
}