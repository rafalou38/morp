<script lang="ts">
	import { Blob } from '$lib/games/capture/Blob';

	// import { Blob } from '$lib/games/capture/Blob';
	import type { N } from '$lib/types/utils';
	import { check } from '$lib/utils/assert';
	import { map, Vector2 } from '$lib/utils/math';
	import { mousPos } from '$lib/utils/pixi';
	import { Application, Text, Graphics, Container, DisplayObject } from 'pixi.js';
	import { onDestroy, onMount } from 'svelte';

	// settings.RESOLUTION = window.devicePixelRatio || 1;
	let app: N<Application>;
	let container: N<HTMLDivElement>;

	onMount(async () => {
		check(container, 'container');
		// debugger;
		app = new Application({
			resizeTo: container,
			backgroundColor: '#fff',
			antialias: true
		});
		container.appendChild(app.view as HTMLCanvasElement);

		const w = app.view.width;
		const h = app.view.height;
		Blob.Configure(app);

		const blobs: Blob[] = [];

		blobs.push(
			new Blob(w / 10, h / 10, 'other'), //
			new Blob(w * (9 / 10), h * (9 / 10), 'self') //
		);

		for (let i = 0; i < 4; i++) {
			const blob = new Blob(
				map(Math.random(), 0, 1, 1 / 10, 9 / 10) * w,
				map(Math.random(), 0, 1, 1 / 10, 9 / 10) * h,
				'clear'
			);
			const newBlobs = [blob, ...blob.mirror(w, h)];
			let overlapped = false;
			check: {
				for (const existing of [...blobs, ...newBlobs]) {
					for (const newBlob of newBlobs) {
						if (existing != newBlob && existing.overlaps(newBlob)) {
							// console.log('overlap:', existing.troops, newBlob.troops);

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

		setInterval(() => {
			for (const blob of blobs) {
				if (blob.owner != 'clear') blob.grow();
			}
		}, 1000);

		setInterval(() => {
			Blob.GameTick();
		}, 50);

		function draw() {
			if (!app) return;

			let pos: N<Vector2> = null;
			try {
				pos = mousPos(app);
			} catch (error) {
				console.warn('Mouse lost');
			}

			for (const blob of blobs) {
				if (pos) {
					blob.reBuild(pos);
				} else {
					blob.reBuild();
				}
			}

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
	<div id="container" bind:this={container} />
</div>

<style>
	#background {
		background: #fff;
		display: grid;
		place-items: center;
		height: 100%;
	}
	#container {
		/* width: 100%;
		height: 100%; */
		aspect-ratio: 1/1;
		width: 100vmin;
	}
</style>
