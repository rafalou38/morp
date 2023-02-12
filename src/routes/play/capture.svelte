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
	const KBD = 0;

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
		let canvasFactor = ((1 / 10) * w) / window.devicePixelRatio;
		let blobs: Blob[] = [];
		let gameEnded = false;
		let gameStarted = false;
		let loading = false;

		let lastDraw = Date.now();
		let monotonic = 0;

		// FPS
		{
			var fpsCounter = new Text('60', {
				fontFamily: 'Arial',
				fill: ['#aaa'],
				fontSize: 10,
			});
			fpsCounter.position.set(0, 0);
			app.stage.addChild(fpsCounter);
		}

		// LOOSE SCREEN
		{
			var looseContainer = new Container();
			var looseBg = new Graphics();
			var bgText = new Text('Waiting opponent', {
				fill: 0x0,
				stroke: 0xffffff,
				strokeThickness: w * 2,
				fontWeight: '900',
				fontSize: ((1 / 10) * w) / window.devicePixelRatio,
			});
			fitText();
			looseBg.beginFill(0x000000);
			looseBg.drawRect(0, 0, w, h);
			looseBg.position.y = h;
			looseContainer.addChild(looseBg);
			looseBg.interactive = false;
			looseBg.cursor = 'none';
			looseContainer.mask = bgText;

			looseBg.position.y = 0;
			app.stage.addChild(looseContainer);
		}

		app.renderer.on('resize', loadScale);
		function fitText() {
			bgText.position.x = w / 2 / window.devicePixelRatio - bgText.width / 2;
			bgText.position.y = h / 2 / window.devicePixelRatio - bgText.height / 2;
			bgText.style.fontSize = canvasFactor;
		}
		function loadScale() {
			check(app);

			w = app.view.width;
			h = app.view.height;
			canvasFactor = ((1 / 10) * w) / window.devicePixelRatio;
			looseBg.width = w;
			looseBg.height = h;

			fitText();

			Blob.loadScale(app);
			Troop.loadScale(app);
		}

		function start() {
			if (!loading) return;
			check(app);
			check($currentConnection);

			console.trace('start');

			Troop.Setup(app);
			Blob.Setup(app);

			loadScale();
			if (looseContainer.parent) looseContainer.parent.removeChild(looseContainer);
			looseBg.position.y = h;
			if ($currentConnection.isHost) {
				Troop.troops.forEach((t) => t.destroy());
				Blob.blobs.forEach((b) => b.destroy());
				blobs = [];
				generateBlobs();
				gameStarted = true;
			}

			gameEnded = false;
			loading = false;
		}
		async function counter(start: number) {
			check(app);
			looseBg.interactive = false;
			looseBg.cursor = 'none';
			if (looseContainer.parent) looseContainer.parent.removeChild(looseContainer);
			looseBg.position.y = 0;
			app.stage.addChild(looseContainer);
			return new Promise<void>((res) => {
				function timer() {
					bgText.text = 5 - Math.floor((Date.now() - start) / 1000);
					fitText();
					if ((Date.now() - start) / 1000 >= 5) {
						if (looseContainer.parent) looseContainer.parent.removeChild(looseContainer);
						res();
					} else {
						setTimeout(timer, 100);
					}
				}
				timer();
			});
		}
		/**
		 * ## Generate Blobs
		 * Creates and initialises `self` & `other` blobs
		 *
		 * > Fils `blobs` array with the clear blobs
		 *
		 * Sends `capture.init` with the list of blobs.
		 */
		function generateBlobs() {
			check($currentConnection);
			check(app);

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
		let fpsWaiter = Waiter(1000);
		let checkWinner = Waiter(500);
		requestAnimationFrame(draw);
		function draw() {
			if (!app) return;
			requestAnimationFrame(draw);

			// Timing
			const dt = Date.now() - lastDraw;
			monotonic += dt;
			if (monotonic % 1000) lastDraw = Date.now();
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
						bgText.text = 'YOU LOST';
						console.log(Troop.troops);
					} else if (other == 0 && !Troop.troops.find((t) => t.owner == 'other')) {
						gameEnded = true;
						bgText.text = 'YOU WON';
					}

					if (gameEnded) {
						app.stage.addChild(looseContainer);
						looseBg.interactive = true;
						looseBg.cursor = 'pointer';
						fitText();
					}
				}
		}
		/**
		 * ##############
		 * ### EVENTS ###
		 * ##############
		 */
		{
			looseBg.onclick = async () => {
				if (loading) return;
				gameStarted = false;
				const startTime = Date.now();
				$currentConnection?.send({ type: 'capture.reset', start: startTime });
				loading = true;
				await counter(startTime);

				start();
			};
			$currentConnection.on('capture.ready', async () => {
				if (loading) return;
				const startTime = Date.now();
				$currentConnection?.send({ type: 'capture.reset', start: startTime });
				loading = true;
				await counter(startTime);
				start();
			});
			$currentConnection.on('capture.reset', async (d) => {
				if (loading) return;
				gameStarted = false;
				loading = true;
				await counter(d.start);
				start();
			});
			$currentConnection.on('capture.init', ({ blobData }) => {
				check(app);

				if (loading) start();

				Troop.troops.forEach((t) => t.destroy());
				Blob.blobs.forEach((b) => b.destroy());
				blobs = [];
				for (const blob of blobData) {
					const basePos = new Vector2(blob.x, blob.y);
					const nPos = basePos.sym(new Vector2(0, 10), new Vector2(10, 0));
					blobs.push(
						new Blob(nPos.x, nPos.y, blob.owner, blob.troops, blob.id).register(app.stage)
					);
				}

				loading = false;
				gameStarted = true;
			});
			$currentConnection.on('capture.troopSpawn', ({ troopData: { x, y, targetID, originID } }) => {
				check(app);

				const target = Blob.blobs.find((b) => b.id == targetID);
				check(target);
				const origin = Blob.blobs.find((b) => b.id == originID);
				check(origin);

				new Troop(origin, target, true, new Vector2(x, y));
			});
			$currentConnection.on('capture.blobUpdate', ({ id, owner, troop }) => {
				check(app);

				const blob: Blob | undefined = Blob.blobs.find((b) => b.id == id);
				check(blob);

				blob.owner = owner;
				blob.troops = troop;
			});

			$currentConnection.send({ type: 'capture.ready' });
		}

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
	});

	onDestroy(() => {
		if (app) {
			app.destroy();
			app = null;
			$currentConnection?.clear('capture');
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
