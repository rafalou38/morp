import { factor } from "$lib/games/tank-trouble/Stores";
import type { EmitterConfigV3, } from "@pixi/particle-emitter";
import { Texture } from "pixi.js";
import { get } from "svelte/store";

export default (color: "red" | "blue"): EmitterConfigV3 => ({
    lifetime: {
        min: 2,
        max: 3
    },
    frequency: 0.05,
    spawnChance: 1,
    particlesPerWave: 8,
    emitterLifetime: 0.1,
    maxParticles: 1000,
    pos: {
        x: 0,
        y: 0
    },
    addAtBack: false,
    behaviors: [
        {
            type: 'alpha',
            config: {
                alpha: {
                    list: [
                        {
                            value: 0.8,
                            time: 0
                        },
                        {
                            value: 0.1,
                            time: 1
                        }
                    ],
                },
            }
        },
        {
            type: 'scaleStatic',
            config: {
                min: 0.15 * get(factor),
                max: 0.15 * get(factor),
            }
        },
        {
            type: 'colorStatic',
            config: {
                color: color == "red" ? "c04141" : "2497c9"
            }
        },
        {
            type: 'moveSpeed',
            config: {
                speed: {
                    list: [
                        {
                            value: 40,
                            time: 0
                        },
                        {
                            value: 20,
                            time: 0.75
                        },
                        {
                            value: 10,
                            time: 1
                        }
                    ],
                    isStepped: false
                },
            }
        },
        {
            type: 'rotationStatic',
            config: {
                min: 0,
                max: 360
            }
        },
        {
            type: 'spawnShape',
            config: {
                type: 'torus',
                data: {
                    x: 0,
                    y: 0,
                    radius: 2 * get(factor),
                    innerRadius: 0.5 * get(factor)
                }
            }
        },
        {
            type: 'textureRandom',
            config: {
                textures: [
                    "/images/particles/chunks/01.png",
                    "/images/particles/chunks/02.png",
                    "/images/particles/chunks/03.png",
                    "/images/particles/chunks/04.png",
                    "/images/particles/chunks/05.png"
                ],
            }
        }
    ],
});