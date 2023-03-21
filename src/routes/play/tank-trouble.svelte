<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentConnection } from '$lib/api/connection';
	import { Maze } from '$lib/games/tank-trouble/Maze';
	import type { N } from '$lib/types/utils';
	import { check } from '$lib/utils/assert';

	import { onDestroy, onMount } from 'svelte';

	import { Application, Text, Graphics, Container, DisplayObject, settings } from 'pixi.js';
	import { Bodies, Body, Composite, Engine, Render, Resolver, Runner } from 'matter-js';
	/* @ts-ignore */
	Resolver._restingThresh = 0.001;

	import { app, appSz, engine, factor } from '$lib/games/tank-trouble/Stores';
	import { Bullet } from '$lib/games/tank-trouble/Bullet';
	import { Tank } from '$lib/games/tank-trouble/Tank';
	import { Waiter } from '$lib/utils/time';
	import { Vector2 } from '$lib/utils/math';

	let container: N<HTMLDivElement>;

	const MAZE_WIDTH = 6;
	const MAZE_HEIGHT = 6;
	const MAZE_HOLES = 5;

	let intervals: NodeJS.Timeout[] = [];

	type GameState = 'waiting' | 'playing' | 'lost' | 'won';
	let gameState: GameState = 'waiting';

	$engine = Engine.create({ gravity: { scale: 0 }, positionIterations: 20 });
	const runner = Runner.create({});
	Runner.run(runner, $engine);

	let myTank: Tank;
	let hisTank: Tank;

	onMount(async () => {
		check(container, 'container');
		check($engine, 'engine');

		window.devicePixelRatio = 2;

		Tank.loadSounds();
		Bullet.loadSounds();

		$app = new Application({
			resizeTo: container,
			resolution: window.devicePixelRatio,
			autoDensity: true,
			antialias: true,
			backgroundColor: '#181818',
		});
		container.appendChild($app.view as HTMLCanvasElement);

		$factor = $app.view.width / window.devicePixelRatio / 100;

		// const render = Render.create({
		// 	element: document.body,
		// 	engine: $engine,
		// });
		// Render.run(render);
		let maze: Maze | undefined;

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

			if (gameState == 'playing') {
				Bullet.reDraw(dt);
				myTank.update();
				hisTank.update();
			}
			requestAnimationFrame(loop);
		}
		requestAnimationFrame(loop);

		intervals.push(
			setInterval(() => {
				if (myTank) {
					myTank.sendPos();
				}
			}, 250)
		);

		function start() {
			if (gameState != 'waiting') return;
			check($app);
			check($engine);

			console.log('[tank-trouble] Game started');
			myTank.reset();
			hisTank.reset();
			Bullet.reset();

			gameState = 'playing';
		}

		if ($currentConnection?.isHost) {
			maze = new Maze(MAZE_WIDTH, MAZE_HEIGHT, MAZE_HOLES);
			let cellWidth = maze.setupScene();

			myTank = new Tank(cellWidth / 2, cellWidth / 2, cellWidth * 0.75, 'self');
			hisTank = new Tank(100 - cellWidth / 2, 100 - cellWidth / 2, cellWidth * 0.75, 'other');

			$currentConnection.send({
				type: 'tank-trouble.reset',
				grid: maze.grid,
				me: myTank.initialPos,
				you: hisTank.initialPos,
			});
			start();
		}

		$currentConnection?.on('tank-trouble.reset', ({ grid, me: him, you: me }) => {
			maze = new Maze(MAZE_WIDTH, MAZE_HEIGHT, MAZE_HOLES, grid);
			let cellWidth = maze.setupScene();
			myTank = new Tank(me.x, me.y, cellWidth * 0.75, 'self');
			hisTank = new Tank(him.x, him.y, cellWidth * 0.75, 'other');
			start();
			// sendPos();
		});
		$currentConnection?.on('tank-trouble.position', ({ pos, angle }) => {
			if (!hisTank) return;
			hisTank.targetPosition = pos;
			hisTank.targetAngle = angle;
		});

		// get(currentConnection)?.send({ type: "tank-trouble.bullet", pos, dir, speed })
		$currentConnection?.on('tank-trouble.bullet', ({ pos, dir, speed }) => {
			new Bullet(Vector2.from(pos), Vector2.from(dir), speed, true);
		});
	});

	function handleClick(e: MouseEvent) {}

	onDestroy(() => {
		intervals.forEach((i) => clearInterval(i));
		intervals = [];
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
