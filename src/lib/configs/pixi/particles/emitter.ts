import { factor } from "$lib/games/tank-trouble/Stores";
import type { EmitterConfigV1 } from "@pixi/particle-emitter";
import { get } from "svelte/store";

export default () => ({
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
							value: 0,
							time: 1
						}
					],
				},
			}
		},
		{
			type: 'scaleStatic',
			config: {
				min: 0.025 * get(factor),
				max: 0.025 * get(factor),
			}
		},
		{
			type: 'colorStatic',
			config: {
				color: "ffffff"
			}
		},
		{
			type: 'moveSpeed',
			config: {
				speed: {
					list: [
						{
							value: 10,
							time: 0
						},
						{
							value: 0,
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
					innerRadius: 1 * get(factor)
				}
			}
		},
		{
			type: 'textureRandom',
			config: {
				textures: [
					"/images/particles/smoke.png",
				],
			}
		}
	],
} as EmitterConfigV1);