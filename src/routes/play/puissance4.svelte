<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentConnection as cc } from '$lib/api/connection';
	import { ownerMap, type Owner } from '$lib/games/capture/utils';

	import type { N } from '$lib/types/utils';
	import { check } from '$lib/utils/assert';
	import { canvasRatio, canvasSize as sz } from '$lib/utils/pixi';
	import { Application, Text, Graphics, Container } from 'pixi.js';
	import { onDestroy, onMount } from 'svelte';

	// settings.RESOLUTION = window.devicePixelRatio || 1;
	let app: N<Application>;
	let container: HTMLDivElement;

	let next: Owner = $cc?.isHost ? 'other' : 'self';
	let gameEnded = false;
	let won = false;
	let gameStarted = false;
	let lastDraw = Date.now();
	let monotonic = 0;

	let padding = 25;

	interface Cell {
		gr: Graphics;
		owner: Owner;
		hovered?: boolean;
	}

	const grid: Cell[][] = [];

	onMount(async () => {
		if (!$cc) return goto('/');

		app = new Application({
			resizeTo: container,
			resolution: window.devicePixelRatio,
			autoDensity: true,
			antialias: true,
			backgroundColor: '#fff',
		});
		container.appendChild(app.view as HTMLCanvasElement);

		const selfColor = $cc?.isHost ? 0xf4d03f : 0xe74c3c;
		const otherColor = !$cc?.isHost ? 0xf4d03f : 0xe74c3c;

		const statusText = new Text('⌛ Waiting for the opponent to join', {
			fill: 0,
			fontSize: 40,
			fontWeight: '700',
		});
		statusText.scale.set(1 / 2);
		app.stage.addChild(statusText);
		function placeText() {
			statusText.position.y = $sz - statusText.height - $canvasRatio * 5;
			statusText.position.x = $sz / 2 - statusText.width / 2;
			statusText.style.fontSize = (1 / 30) * $sz * 2;
		}

		app.renderer.on('resize', loadScale);
		function loadScale() {
			check(app);
			$sz = app.view.width / window.devicePixelRatio;
			$canvasRatio = (1 / 100) * $sz;
			placeText();
			if (background) {
				background.clear();
				background
					.beginFill(0x283593) //
					.drawRect(0, 0, $sz, $sz * (6 / 7));
				padding = $sz / 25;
				const psz = $sz - padding;
				cellRadius = psz / 7 / 2.5;

				for (let x = 0; x < 7; x++) {
					for (let y = 0; y < 6; y++) {
						let tx = (psz / 7) * x + psz / 7 / 2;
						let ty = (psz / 7) * y + psz / 7 / 2;
						grid[x][y].gr.clear();
						grid[x][y].gr.position.set(tx + padding / 2, ty + padding / 2);
						background.beginHole();
						background.drawCircle(tx + padding / 2, ty + padding / 2, cellRadius);
					}
				}

				reDraw();
			}
		}

		loadScale();
		var background = new Graphics() //
			.beginFill(0x283593)
			.drawRect(0, 0, $sz, $sz * (6 / 7));
		app.stage.addChild(background);

		const cells = new Container();
		app.stage.addChild(cells);

		const psz = $sz - padding * 2;
		let cellRadius = psz / 7 / 2.5;
		function getBottomCellY(x: number) {
			let bottomPos = -1;
			for (let i = 0; i < 6; i++) {
				if (grid[x][i].owner != 'clear') {
					break;
				} else {
					bottomPos++;
				}
			}

			return bottomPos;
		}
		function checkWinner() {
			let conseqSelf = 0;
			let conseqOther = 0;
			check: {
				let last: Owner = 'clear';
				function step(x: number, y: number) {
					if (last != grid[x][y].owner) {
						conseqSelf = 0;
						conseqOther = 0;
					}
					if (grid[x][y].owner == 'self') {
						conseqSelf++;
					} else if (grid[x][y].owner == 'other') {
						conseqOther++;
					}

					if (conseqOther >= 4 || conseqSelf >= 4) return true;
					last = grid[x][y].owner;
				}

				for (let y = 0; y < 6; y++) {
					for (let x = 0; x < 7; x++) {
						if (step(x, y)) break check;
					}
				}
				for (let x = 0; x < 7; x++) {
					for (let y = 0; y < 6; y++) {
						if (step(x, y)) break check;
					}
				}

				for (let startX = 0; startX < 4; startX++) {
					let y = 0;
					let x = startX;

					while (x < 7 && y < 6) {
						if (step(x, y)) break check;

						y++;
						x++;
					}
				}
				for (let startX = 3; startX < 7; startX++) {
					let y = 0;
					let x = startX;

					while (x >= 0 && y < 6) {
						if (step(x, y)) break check;

						y++;
						x--;
					}
				}
				for (let startY = 0; startY < 3; startY++) {
					let x = 0;
					let y = startY;

					while (x < 7 && y < 6) {
						if (step(x, y)) break check;

						y++;
						x++;
					}
				}
				for (let startY = 2; startY < 7; startY++) {
					let x = 0;
					let y = startY;

					while (x >= 0 && y < 6) {
						if (step(x, y)) break check;

						y++;
						x--;
					}
				}

				return;
			}

			if (conseqOther >= 4) {
				gameEnded = true;
				won = false;
			} else {
				gameEnded = true;
				won = true;
			}
		}

		/*
            #############
            ### SETUP ###
            ############# 
        */
		function setup() {
			for (let x = 0; x < 7; x++) {
				// Reuse if already exiting
				grid[x] = grid[x] || [];
				for (let y = 0; y < 6; y++) {
					let tx = (psz / 7) * x + psz / 7 / 2;
					let ty = (psz / 7) * y + psz / 7 / 2;
					background.beginHole();
					background.drawCircle(tx + padding, ty + padding, cellRadius);

					const cellGr = grid[x][y]?.gr || new Graphics();
					cellGr.clear();
					cellGr.removeAllListeners();

					cellGr.position.set(tx + padding, ty + padding);
					cellGr.beginFill(0xffffff);
					cellGr.drawCircle(0, 0, cellRadius);

					cellGr.interactive = true;
					cellGr.cursor = 'pointer';
					cellGr.onmouseenter = () => {
						if (next != 'self') return;
						const botY = getBottomCellY(x);
						if (botY < 0) return;

						const bottomCell = grid[x][botY];
						bottomCell.hovered = true;
						reDraw();
					};
					cellGr.onmouseleave = () => {
						const botY = getBottomCellY(x);
						if (botY < 0) return;

						const bottomCell = grid[x][botY];
						bottomCell.hovered = false;
						reDraw();
					};

					cellGr.onclick = () => {
						if (next != 'self' || gameEnded) return;
						const botY = getBottomCellY(x);
						if (botY < 0) return;

						const bottomCell = grid[x][botY];
						bottomCell.owner = 'self';
						bottomCell.hovered = false;

						$cc?.send({ type: 'puissance4.move', x });
						next = ownerMap.get(next)!;
						checkWinner();

						reDraw();
					};
					cells.addChild(cellGr);
					grid[x][y] = {
						owner: 'clear',
						gr: cellGr,
						hovered: false,
					};
				}
			}
			loadScale();
			gameStarted = true;
			gameEnded = false;
		}
		function reset() {
			$cc?.send({ type: 'puissance4.reset' });
			setup();
		}
		function reDraw() {
			for (let x = 0; x < 7; x++) {
				for (let y = 0; y < 6; y++) {
					const cell = grid[x][y];
					cell.gr.clear();
					let fill = [0xffffff, 1];
					if (cell.hovered) {
						fill = [selfColor, 0.5];
					} else if (cell.owner == 'self') {
						fill = [selfColor, 1];
					} else if (cell.owner == 'other') {
						fill = [otherColor, 1];
					}

					cell.gr.beginFill(...fill);
					cell.gr.drawCircle(0, 0, cellRadius);
				}
			}
		}

		/*
           #################
           ### MAIN LOOP ###
           #################
         */
		requestAnimationFrame(draw);
		function draw() {
			if (!app) return;
			requestAnimationFrame(draw);

			// Timing
			const dt = Date.now() - lastDraw;
			monotonic += dt;
			if (monotonic % 1000) lastDraw = Date.now();

			if (gameStarted) {
				for (let x = 0; x < 7; x++) {
					for (let y = 0; y < 6; y++) {
						if (next == 'self' && gameStarted && !gameEnded) {
							grid[x][y].gr.interactive = true;
							grid[x][y].gr.cursor = 'pointer';
						} else {
							grid[x][y].hovered = false;
							grid[x][y].gr.interactive = false;
							grid[x][y].gr.cursor = 'not-allowed';
						}
					}
				}
			}

			if (!gameStarted) {
				statusText.text = 'Waiting for the opponent to join ⌛';
			} else if (gameEnded && won) {
				statusText.text = '👆 You won 😃';
				statusText.interactive = true;
				statusText.cursor = 'pointer';
				statusText.onclick = reset;
			} else if (gameEnded && !won) {
				statusText.text = '👆 You Lost ☹️';
				statusText.interactive = true;
				statusText.cursor = 'pointer';
				statusText.onclick = reset;
			} else if (next == 'self') {
				statusText.text = "It's you turn ⚡";
			} else {
				statusText.text = 'Waiting for the opponent ⌛';
			}

			placeText();
		}

		$cc.send({ type: 'puissance4.ready' });
		$cc?.on('puissance4.reset', () => {
			setup();
		});
		$cc?.on('puissance4.ready', () => {
			if (!gameStarted) {
				$cc?.send({ type: 'puissance4.ready' });
				setup();
			}
		});
		$cc?.on('puissance4.move', ({ x }) => {
			const botY = getBottomCellY(x);
			const bottomCell = grid[x][botY];
			bottomCell.owner = 'other';
			bottomCell.hovered = false;

			checkWinner();

			next = ownerMap.get(next)!;
			reDraw();
		});
	});

	onDestroy(() => {
		if (app) {
			app.destroy();
			app = null;
			$cc?.clear('puissance4');
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
		/* border: #283593 16px solid;
		border-bottom: none;
		border-top: none; */
		position: relative;
		aspect-ratio: 1/1;
		width: 100vmin;
	}
	:global(#pixi-capture-container canvas) {
		display: block;
		width: 100%;
		height: 100%;
		position: absolute;
	}
</style>
