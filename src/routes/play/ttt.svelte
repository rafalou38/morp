<script lang="ts">
	import { browser } from '$app/env';
	import { currentConnection } from '$lib/api/connection';

	import CharacterChoose from '$lib/games/CharacterChoose.svelte';
	import Icon from '@iconify/svelte';
	let state: null | 'waiting OP' | 'OP waiting' | 'started' = null;
	let myChar = '';
	let opponentChar = '';
	let gameReady = false;
	let MeNext = false;
	$: gameReady = myChar && opponentChar && myChar !== opponentChar && state !== 'waiting OP';

	let winSequence: null | number[][] = null;
	let winner = '';
	let board: (null | string)[][] = [
		[null, null, null],
		[null, null, null],
		[null, null, null]
	];

	function ready() {
		$currentConnection.send({
			type: 'readyTTTGame'
		});
		if (state === 'OP waiting') start();
		else state = 'waiting OP';
	}
	function start() {
		state = 'started';
		if ($currentConnection.isHost) {
			// Host chooses who starts
			let hostStarts = Math.round(Math.random());
			if (hostStarts) {
				$currentConnection.send({
					type: 'whoFirst',
					data: 'ME'
				});
				MeNext = true;
			} else {
				$currentConnection.send({
					type: 'whoFirst',
					data: 'YOU'
				});
				MeNext = false;
			}
		}
	}
	function take(x: number, y: number) {
		if (!MeNext || board[y][x] !== null || winner) return;

		board[y][x] = myChar;
		$currentConnection.send({
			type: 'takeTTT',
			data: {
				x,
				y
			}
		});
		MeNext = false;
		checkWinner();
	}

	function checkWinner() {
		function whoWon() {
			const diag1 = [board[0][0], board[1][1], board[2][2]];
			const diag2 = [board[0][2], board[1][1], board[2][0]];
			for (const c of [myChar, opponentChar]) {
				if (diag1.every((cell) => cell === c)) {
					winSequence = [
						[0, 0],
						[1, 1],
						[2, 2]
					];
					return diag1[0];
				}
				if (diag2.every((cell) => cell === c)) {
					winSequence = [
						[0, 2],
						[1, 1],
						[2, 0]
					];
					return diag2[0];
				}
			}
			for (let i = 0; i < 3; i++) {
				const row = board[i];
				const col = board.map((row) => row[i]);
				for (const c of [myChar, opponentChar]) {
					if (row.every((cell) => cell === c)) {
						winSequence = [
							[i, 0],
							[i, 1],
							[i, 2]
						];
						return row[0];
					}
					if (col.every((cell) => cell === c)) {
						winSequence = [
							[0, i],
							[1, i],
							[2, i]
						];
						return row[0];
					}
				}
			}
		}

		winner = whoWon();

		if (winner) return console.log('[game]', 'winner:', winner);

		// check for draw
		if (board.every((row) => row.every((cell) => cell !== null))) {
			winner = 'draw';
			return console.log('[game]', 'draw');
		}
	}

	function reset(remote = false) {
		if (!remote)
			$currentConnection.send({
				type: 'resetTTT'
			});
		board = [
			[null, null, null],
			[null, null, null],
			[null, null, null]
		];
		winner = '';
		winSequence = null;
		start();
	}

	if (browser) {
		$currentConnection?.on('readyTTTGame', () => {
			if (state == 'waiting OP') start();
			else state = 'OP waiting';
		});
		$currentConnection?.on('whoFirst', ({ data: who }) => {
			if (who === 'YOU') MeNext = true;
			else MeNext = false;
		});
		$currentConnection?.on('takeTTT', ({ data: { x, y } }) => {
			if (MeNext) alert('There was a sync error, please restart the game');
			else {
				board[y][x] = opponentChar;
				MeNext = true;
				checkWinner();
			}
		});
		$currentConnection?.on('resetTTT', () => {
			reset(true);
		});
	}
</script>

<h1 class="text-center font-bold text-5xl text-white pt-8">Tic-Tac-Toe</h1>
{#if state === 'started'}<!--







  	-->
	<div class="flex flex-col gap-16 justify-center grow">
		<div
			class="flex flex-col gap-1 w-full max-w-[50vmin] mx-auto bg-gray-600 rounded overflow-hidden"
		>
			{#each board as row, y}
				<div class="flex gap-1">
					{#each row as cell, x}
						<div
							class="relative grow aspect-square bg-slate-500 cursor-pointer "
							class:cursor-not-allowed={!MeNext || cell !== null || winner}
							class:opacity-60={winSequence &&
								!winSequence.find(([y_, x_]) => x === x_ && y === y_)}
							on:click={() => take(x, y)}
						>
							<div class="absolute inset-0 grid place-items-center cell pointer-events-none">
								{cell || ''}
							</div>
						</div>
					{/each}
				</div>
			{/each}
		</div>
		<p class="font-bold text-5xl text-center text-white">
			{#if winner == myChar}
				You won! 😀
			{:else if winner == opponentChar}
				You lost! 💀
			{:else if winner == 'draw'}
				Draw! 😐
			{:else if MeNext}
				You are next: {myChar}
			{:else}
				Waiting for opponent: {opponentChar}
			{/if}
		</p>
		{#if winner}
			<button
				class="flex items-center gap-4 mx-auto bg-fuchsia-500 opacity-60 w-min px-6 py-4 text-white rounded-lg font-bold text-2xl transition-transform cursor-not-allowed enabled"
				on:click={() => reset()}
			>
				Restart! <Icon icon="heroicons-outline:refresh" class="text-3xl" />
			</button>
		{/if}
	</div>

	<!--







  -->
{:else}
	<div class="flex flex-col grow">
		<div class="grow">
			<CharacterChoose bind:opponent={opponentChar} bind:chosenCharacter={myChar} {state} />
		</div>
		<button
			class="flex items-center gap-4 mx-auto bg-fuchsia-500 opacity-60 w-min px-6 py-4 text-white rounded-lg font-bold text-2xl transition-transform cursor-not-allowed"
			disabled={!gameReady}
			class:enabled={gameReady}
			on:click={ready}
		>
			PLAY! <Icon icon="heroicons-outline:play" class="text-3xl" />
		</button>
	</div>
{/if}

<style lang="postcss">
	.enabled {
		cursor: pointer;
		opacity: 1;
	}

	.cell {
		font-size: min(64px, 10vw);
	}
</style>
