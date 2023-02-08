<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentConnection } from '$lib/api/connection';
	import { Blob } from '$lib/games/capture/Blob';
	import { Troop } from '$lib/games/capture/Troop';
	import { ownerMap, type Owner } from '$lib/games/capture/utils';

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

	const GRID = 0;
	const KBD = 1;

	onMount(async () => {
		check(container, 'container');
		if (!$currentConnection) return goto('/');
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

		// FPS
		const fpsCounter = new Text('60', {
			fontFamily: 'Arial',
			fill: ['#aaa'],
			fontSize: 10,
		});
		fpsCounter.position.set(0, 0);
		app.stage.addChild(fpsCounter);

		// LOOSE SCREEN
		const looseBg = new Graphics();
		const looseContainer = new Container();
		const bgText = new Text('YOU WON', {
			fill: 0x0,
			stroke: 0xffffff,
			strokeThickness: w,
			fontWeight: '900',
			fontSize: ((1 / 10) * w) / window.devicePixelRatio,
		});

		looseBg.beginFill(0x000000);
		looseBg.drawRect(0, 0, w, h);
		looseBg.position.y = h;
		// setInterval(() => (bg.position.y += 1), 10);
		looseContainer.addChild(looseBg);

		bgText.position.x = w / 2 - bgText.width / 2;
		bgText.position.y = h / 2 - bgText.height / 2;

		looseContainer.mask = bgText;

		const grid = new Graphics();
		function setup() {
			check(app);
			w = app.view.width;
			h = app.view.height;
			const canvasFactor = ((1 / 10) * w) / window.devicePixelRatio;
			bgText.style.fontSize = canvasFactor;

			if (GRID) {
				grid.clear();
				grid.lineStyle({ width: 1, color: 0xcccccc });

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
		if ($currentConnection.isHost) {
			blobs.push(
				new Blob(1, 1, 'other'), //
				new Blob(9, 9, 'self')
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

				if (!overlapped) {
					blobs.push(...newBlobs);
				} else {
					newBlobs.forEach((b) => b.destroy());
				}
			}
			for (const blob of blobs) {
				blob.register(app.stage);
			}

			$currentConnection.send({
				type: 'capture.init',
				blobData: blobs.map((blob) => ({
					x: blob.pos.x,
					y: blob.pos.y,
					troops: blob.troops,
					owner: ownerMap.get(blob.owner),
					id: blob.id,
				})),
			});
		}

		/**#######################
		 * ###    GAME LOOP    ###
		 * #######################
		 */
		let gameEnded = false;
		let gameStarted = $currentConnection.isHost;
		let won = false;
		let last = Date.now();
		let monotonic = 0;
		let fpsWaiter = Waiter(1000);
		let checkWinner = Waiter(500);

		function draw() {
			if (!app) return;
			requestAnimationFrame(draw);

			// Timing
			const dt = Date.now() - last;
			monotonic += dt;
			if (monotonic % 1000) last = Date.now();
			if (fpsWaiter()) {
				fpsCounter.text = Math.round(1000 / dt) + ' - ' + dt;
			}

			if (gameEnded) {
				looseBg.position.y = Math.max(0, looseBg.position.y * (1 - 0.75 / dt));
			}
			if (!gameStarted || gameEnded) return;

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

			// Check winner
			if (checkWinner())
				check: {
					let self = 0;
					let other = 0;
					for (const blob of blobs) {
						if (blob.owner == 'self') self++;
						else if (blob.owner == 'other') other++;
					}

					if (self == 0 && !Troop.troops.find((t) => t.owner == 'self')) {
						gameEnded = true;
						won = false;
						bgText.text = 'YOU LOST';
					} else if (other == 0 && !Troop.troops.find((t) => t.owner == 'other')) {
						gameEnded = true;
						won = true;
						bgText.text = 'YOU WON';
					}

					if (gameEnded) {
						app.stage.addChild(looseContainer);
						setTimeout(() => goto('/play/capture', 1000 * 10));
					}
				}
		}
		requestAnimationFrame(draw);

		if (KBD)
			container.addEventListener('keydown', ({ key }) => {
				if (key === ' ') {
					if (Blob.selecting) {
						Blob.blobs.forEach((b) => (b.selected = false));
						Blob.selecting = false;
					} else {
						Blob.blobs.forEach((b) => {
							if (b.owner == 'self') {
								b.selected = true;
								Blob.selecting = true;
							}
						});
					}
				}
			});

		/**#######################
		 * ###    CONNECTION   ###
		 * #######################
		 */
		console.log($currentConnection);

		$currentConnection.on('capture.init', ({ blobData }) => {
			check(app);
			gameStarted = true;
			for (const blob of blobData) {
				const basePos = new Vector2(blob.x, blob.y);
				const nPos = basePos.sym(new Vector2(0, 10), new Vector2(10, 0));
				blobs.push(new Blob(nPos.x, nPos.y, blob.owner, blob.troops, blob.id).register(app.stage));
			}
		});
		$currentConnection.on('capture.troopSpawn', ({ troopData: { x, y, targetID, originID } }) => {
			check(app);

			const target = Blob.blobs.find((b) => b.id == targetID);
			check(target);
			const origin = Blob.blobs.find((b) => b.id == originID);
			check(origin);

			// console.log(origin.owner);

			new Troop(origin, target, true);
		});

		$currentConnection.on('capture.blobUpdate', ({ id, owner, troop }) => {
			check(app);

			const blob: Blob | undefined = Blob.blobs.find((b) => b.id == id);
			check(blob);

			blob.owner = owner;
			blob.troops = troop;
		});
	});

	onDestroy(() => {
		if (app) {
			app.destroy();
			app = null;
		}
	});
</script>

<div id="background">
	<div id="pixi-capture-container" bind:this={container} tabindex="0" />
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
