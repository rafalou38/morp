<script lang="ts">
	import { Blob } from '$lib/games/capture/Blob';
	import { Troop } from '$lib/games/capture/Troop';

	// import { Blob } from '$lib/games/capture/Blob';
	import type { N } from '$lib/types/utils';
	import { check } from '$lib/utils/assert';
	import { map, Vector2 } from '$lib/utils/math';
	import { mousPos } from '$lib/utils/pixi';
	import { Waiter } from '$lib/utils/time';
	import { Application, Text, Graphics, Container, DisplayObject, settings } from 'pixi.js';
	import { onDestroy, onMount } from 'svelte';

	// settings.RESOLUTION = window.devicePixelRatio || 1;
	let app: N<Application>;
	let container: N<HTMLDivElement>;

	onMount(async () => {
		check(container, 'container');
		// debugger;
		app = new Application({
			resizeTo: container,
			resolution: window.devicePixelRatio,
			autoDensity: true,
			antialias: true,
			backgroundColor: '#fff',
		});
		container.appendChild(app.view as HTMLCanvasElement);

		let w = app.view.width;
		let h = app.view.height;

		const fpsCounter = new Text('60', {
			fontFamily: 'Arial',
			fill: ['#aaa'],
			fontSize: 10,
		});
		fpsCounter.position.set(0, 0);
		app.stage.addChild(fpsCounter);

		const grid = new Graphics();

		function setup() {
			check(app);

			// settings.RESOLUTION = window.devicePixelRatio;

			w = app.view.width;
			h = app.view.height;

			if (0) {
				grid.clear();
				grid.lineStyle({ width: 1, color: 0xcccccc });
				// debugger;
				const canvasFactor = ((1 / 10) * w) / window.devicePixelRatio;
				// const canvasFactor = 110.4;
				console.log(canvasFactor);

				for (let col = 0; col < 10; col++) {
					grid.moveTo(col * canvasFactor, 0);
					grid.lineTo(col * canvasFactor, h);
				}
				for (let roz = 0; roz < 10; roz++) {
					grid.moveTo(0, roz * canvasFactor);
					grid.lineTo(w, roz * canvasFactor);
				}
				app.stage.addChild(grid);
			}

			Troop.Setup(app);
			Blob.Configure(app);
		}
		setup();

		app.renderer.on('resize', setup);
		/**
		 * #######################
		 * ### BLOB GENERATION ###
		 * #######################
		 */
		const blobs: Blob[] = [];
		blobs.push(
			new Blob(1, 1, 'other'), //
			new Blob(9, 9, 'self') //
		);
		for (let i = 0; i < 6; i++) {
			const blob = new Blob(
				map(Math.random(), 0, 1, 1, 9),
				map(Math.random(), 0, 1, 1, 9),
				'clear'
			);
			const newBlobs = [blob, ...blob.mirror()];
			let overlapped = false;
			check: {
				for (const existing of [...blobs, ...newBlobs]) {
					for (const newBlob of newBlobs) {
						if (existing != newBlob && existing.overlaps(newBlob)) {
							i--;
							overlapped = true;
							break check;
						}
					}
				}
			}

			if (!overlapped) blobs.push(...newBlobs);
		}
		for (const blob of blobs) {
			blob.register(app.stage);
		}

		/**#######################
		 * ###    GAME LOOP    ###
		 * #######################
		 */
		let last = Date.now();
		let monotonic = 0;
		let fpsWaiter = Waiter(1000);

		// new Troop(blobs[1], blobs[0], 'self');
		function draw() {
			if (!app) return;

			// Timing
			const dt = Date.now() - last;
			monotonic += dt;
			if (monotonic % 1000) last = Date.now();
			if (fpsWaiter()) {
				fpsCounter.text = Math.round(1000 / dt) + ' - ' + dt;
			}

			// Mouse position fetching
			let pos: N<Vector2> = null;
			try {
				pos = mousPos(app);
			} catch (error) {
				console.warn('Mouse lost');
			}

			// Blob loop
			Blob.GameTick();
			for (const blob of blobs) {
				if (pos) {
					blob.reBuild(pos);
				} else {
					blob.reBuild();
				}
			}

			// Troops

			Troop.Update(dt);
			Troop.Draw();

			requestAnimationFrame(draw);
		}
		requestAnimationFrame(draw);
	});

	onDestroy(() => {
		if (app) {
			app.destroy();
			app = null;
		}
	});
</script>

<div id="background">
	<div id="pixi-capture-container" bind:this={container} />
</div>

<style>
	#background {
		background: #eee;
		display: grid;
		place-items: center;
		height: 100%;
	}
	#pixi-capture-container {
		/* width: 100%;
		height: 100%; */
		position: relative;
		aspect-ratio: 1/1;
		width: 100vmin;
	}
	:global(#pixi-capture-container canvas) {
		width: 100%;
		height: 100%;
		position: absolute;
	}
</style>
