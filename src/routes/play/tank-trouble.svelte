<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentConnection } from '$lib/api/connection';
	import { Maze } from '$lib/games/tank-trouble/Maze';
	import type { N } from '$lib/types/utils';
	import { check } from '$lib/utils/assert';
	import { shuffle, Vector2 } from '$lib/utils/math';

	import { onDestroy, onMount } from 'svelte';

	import { Application, Text, Graphics, Container, DisplayObject, settings } from 'pixi.js';
	import { Bodies, Composite, Engine, Render, Resolver, Runner } from 'matter-js';
	/* @ts-ignore */
	Resolver._restingThresh = 0.001;

	import { app, appSz, engine } from '$lib/games/tank-trouble/Stores';
	import { Bullet } from '$lib/games/tank-trouble/Bullet';
	import { Tank } from '$lib/games/tank-trouble/Tank';
	import { Waiter } from '$lib/utils/time';

	let container: N<HTMLDivElement>;

	type GameState = 'waiting' | 'playing' | 'lost' | 'won';
	let gameState: GameState = 'waiting';
	const maze = new Maze(5, 5, 5);
	let cellWidth = 0;

	$engine = Engine.create({ gravity: { scale: 0 }, positionIterations: 20 });
	const runner = Runner.create({});
	Runner.run(runner, $engine);

	let myTank: Tank;

	onMount(async () => {
		check(container, 'container');
		check($engine, 'engine');

		window.devicePixelRatio = 2;

		$app = new Application({
			resizeTo: container,
			resolution: window.devicePixelRatio,
			autoDensity: true,
			antialias: true,
			backgroundColor: '#181818',
		});
		container.appendChild($app.view as HTMLCanvasElement);

		// const render = Render.create({
		// 	element: document.body,
		// 	engine: $engine,
		// });
		// Render.run(render);

		cellWidth = maze.setupScene($appSz);

		myTank = new Tank(cellWidth / 2, cellWidth / 2, cellWidth * 0.75, 'self');

		// FPS
		const fpsCounter = new Text('60', {
			fontFamily: 'Arial',
			fill: ['#fff'],
			fontWeight: 'bold',
			fontSize: 10,
			stroke: '#000',
			strokeThickness: 2,
		});
		fpsCounter.position.set(-1, -5);
		$app.stage.addChild(fpsCounter);

		function start() {
			if (gameState != 'waiting') return;
			check($app);
			check($engine);

			console.log('[tank-trouble] Game started');

			gameState = 'playing';
		}

		start();

		let last = Date.now();
		const fpsWait = Waiter(500);
		function loop() {
			if (!$app) return;

			const dt = Date.now() - last;
			last = Date.now();
			if (fpsWait()) {
				const fps = 1000 / dt;
				fpsCounter.text = Math.round(fps);
			}
			// console.log($app.stage.width);

			Bullet.reDraw(dt);
			myTank.update();
			requestAnimationFrame(loop);
		}
		requestAnimationFrame(loop);
	});

	function handleClick(e: MouseEvent) {}

	onDestroy(() => {
		if ($app) {
			$app.destroy();
			$app = null;
			$currentConnection?.clear('capture');
		}
	});
</script>

<svelte:body on:click={handleClick} />

<div id="background">
	<div id="pixi-container" bind:this={container} tabindex="0" />
</div>

<style>
	#background {
		background: #181818;
		display: grid;
		place-items: center;
		height: 100%;
	}
	#pixi-container {
		position: relative;
		aspect-ratio: 1/1;
		width: 100vmin;
	}
	:global(#pixi-container canvas) {
		width: 100%;
		height: 100%;
		position: absolute;
	}
</style>
