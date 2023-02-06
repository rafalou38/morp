<script lang="ts">
	import { Blob } from '$lib/games/capture/Blob';
	import type { N } from '$lib/types/utils';
	import { check } from '$lib/utils/assert';
	import { map } from '$lib/utils/math';
	import { Application, Text } from 'pixi.js';
	import { onDestroy, onMount } from 'svelte';

	// settings.RESOLUTION = window.devicePixelRatio || 1;
	let app: N<Application>;
	let container: N<HTMLDivElement>;

	onMount(async () => {
		check(container, 'container');
		app = new Application({
			resizeTo: container,
			backgroundColor: '#fff',
			antialias: true
		});
		container.appendChild(app.view as HTMLCanvasElement);

		const w = app.view.width;
		const h = app.view.height;

		const blobs: Blob[] = [];

		blobs.push(
			new Blob(w / 10, h / 10, 'self'), //
			new Blob(w * (9 / 10), h * (9 / 10), 'self') //
		);

		for (let i = 0; i < 10; i++) {
			blobs.push(
				new Blob(
					map(Math.random(), 0, 1, 1 / 10, 9 / 10) * w,
					map(Math.random(), 0, 1, 1 / 10, 9 / 10) * h,
					'clear'
				)
			);
		}

		for (const blob of blobs) {
			blob.register(app.stage);
		}
		const t = new Text('eeeeee', {
			fontFamily: 'Arial',
			fill: ['#ffffff']
		});
		t.x = 100;
		t.y = 100;
		app.stage.addChild(t);

		// setTimeout();
	});

	onDestroy(() => {
		if (app) {
			app.destroy();
			app = null;
		}
	});
</script>

<div id="container" bind:this={container} />

<style>
	#container {
		width: 100%;
		height: 100%;
	}
</style>
