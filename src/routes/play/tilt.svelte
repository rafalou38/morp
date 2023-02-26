<script lang="ts">
	import { ScenePlay } from '$lib/games/tilt/ScenePlay';
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	let ECanvas: HTMLCanvasElement;

	onMount(() => {
		const scenePlay = new ScenePlay();

		const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: ECanvas });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setAnimationLoop(animation);

		// animation
		function animation(time: number) {
			scenePlay.update(time);

			renderer.render(scenePlay, scenePlay.camera);
		}
	});
</script>

<canvas bind:this={ECanvas} />

<style>
	canvas {
		width: 100%;
		height: 100%;
	}
</style>
