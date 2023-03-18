import type { EmitterConfigV1 } from "@pixi/particle-emitter";

export default {
	"alpha": {
		"start": 1,
		"end": 0
	},
	"scale": {
		"start": 0.125,
		"end": 0.125,
		"minimumScaleMultiplier": 1
	},
	"color": {
		"start": "#ffffff",
		"end": "#ffffff"
	},
	"speed": {
		"start": 50,
		"end": 0,
		"minimumSpeedMultiplier": 1
	},
	"acceleration": {
		"x": 0,
		"y": 0
	},
	"maxSpeed": 0,
	"startRotation": {
		"min": 0,
		"max": 360
	},
	"noRotation": false,
	"rotationSpeed": {
		"min": 0,
		"max": 0
	},
	"lifetime": {
		"min": 0.8,
		"max": 0.8
	},
	"blendMode": "normal",
	"frequency": 1,
	"emitterLifetime": 2,
	"maxParticles": 25,
	"pos": {
		"x": 0,
		"y": 0
	},
	"addAtBack": false,
	"spawnType": "burst",
	"particlesPerWave": 25,
	"particleSpacing": 0,
	"angleStart": 0,
} as EmitterConfigV1;