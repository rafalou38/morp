import { DEG_TO_RAD, Sprite } from "pixi.js";
import type { Owner } from "../capture/utils";
import { app } from "./Stores";
import { get } from "svelte/store";
import { pressedKeys } from "$lib/utils/input";
import { Vector2 } from "$lib/utils/math";
import { Bullet } from "./Bullet";


const speed = 2;
const turnSpeed = 1.5;

export class Tank {
    x: number;
    y: number;
    direction = Math.PI / 2;
    owner: string;

    sprite: Sprite;
    constructor(x: number, y: number, size: number, owner: Owner) {
        this.x = x;
        this.y = y;
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
        this.sprite.rotation = this.direction;

        get(app)?.stage.addChild(this.sprite);
    }

    update() {
        if (pressedKeys.has("d")) {
            this.direction += turnSpeed * DEG_TO_RAD;
        }
        if (pressedKeys.has("a")) {
            this.direction += -turnSpeed * DEG_TO_RAD;
        }

        const movement = new Vector2(Math.cos((this.direction - Math.PI / 2)), Math.sin((this.direction - Math.PI / 2)))
        // console.log(movement);
        movement.setNorm(speed);

        if (pressedKeys.has("w")) {
            this.x += movement.x;
            this.y += movement.y;
            // this.direction += 1;
        }

        if (pressedKeys.has("s")) {
            this.x -= movement.x;
            this.y -= movement.y;
            // this.direction += 1;
        }

        if (pressedKeys.has(" ")) {
            pressedKeys.delete(" ");

            new Bullet(Vector2.from(this).add(movement.setNorm(this.sprite.width * 0.6)), movement, 8);
        }




        this.sprite.position.set(this.x, this.y);
        this.sprite.rotation = this.direction;
    }
}