<script lang="ts">
	import { browser } from '$app/env';
	import { currentConnection } from '$lib/api/connection';

	import CharacterChoose from '$lib/games/CharacterChoose.svelte';
	import { TicTacToeUltimate } from '$lib/games/TicTacToeUltimate';
	import Icon from '@iconify/svelte';
	let state: null | 'waiting OP' | 'OP waiting' | 'started' = null;

	import type { WritableC } from '$lib/utils/writable';

	let myChar = '';
	let opponentChar = '';
	let gameReady = false;
	$: gameReady = myChar && opponentChar && myChar !== opponentChar && state !== 'waiting OP';
	let game: TicTacToeUltimate;

	// GAME STORES
	let winner: WritableC<{
		character: string;
		winSequence: number[];
	} | null>;
	let grid: WritableC<((null | string)[] | string)[]>;
	let curentSubGridIndex: WritableC<number>;
	let meNext: WritableC<boolean>;
	// END GAME STORES

	function ready() {
		$currentConnection.send({
			type: 'readyTTTGame'
		});
		if (state === 'OP waiting') start();
		else state = 'waiting OP';
	}

	function start() {
		game = new TicTacToeUltimate($currentConnection, myChar, opponentChar);
		({ winner, grid, curentSubGridIndex, meNext } = game.getStores());
		console.log({ winner, grid, curentSubGridIndex, meNext });

		game.start();
	}

	if (browser) {
		$currentConnection.on('readyTTTGame', () => {
			if (state == 'waiting OP') start();
			else state = 'OP waiting';
		});
	}
</script>

<h1 class="text-center font-bold text-5xl text-white pt-8">Tic-Tac-Toe</h1>
{#if game}<!--







  	-->
	<div class="flex flex-col gap-16 justify-center grow">
		<div
			class="relative grid grid-cols-3 gap-1 w-full max-w-[50vmin] mx-auto rounded overflow-hidden"
		>
			{#each $grid as subGrid, i}
				<div
					class="relative w-full aspect-square opacity-60 cursor-not-allowed"
					class:activeSubGrid={($winner && $winner.winSequence.find((k) => k === i)) ||
						(!$winner && $curentSubGridIndex === i)}
				>
					{#if typeof subGrid === 'string'}
						<div
							class="absolute inset-0 grid place-items-center cell pointer-events-none bg-slate-500 big"
						>
							{subGrid || ''}
						</div>
					{:else}
						<div class="grid grid-cols-3 gap-px">
							{#each subGrid as cell, j}
								<div
									class="relative aspect-square bg-slate-500 cursor-pointer"
									class:cursor-not-allowed={$curentSubGridIndex !== i ||
										!$meNext ||
										cell !== null ||
										$winner}
									on:click={() => $curentSubGridIndex === i && game.take(j)}
								>
									<div class="absolute inset-0 grid place-items-center cell pointer-events-none">
										{cell || ''}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
		<p class="font-bold text-5xl text-center text-white" on:click={() => console.log(game)}>
			{#if $winner?.character == myChar}
				You won! 😀
			{:else if $winner?.character == opponentChar}
				You lost! 💀
			{:else if $winner?.character == 'draw'}
				Draw! 😐
			{:else if $meNext}
				You are next: {myChar}
			{:else}
				Waiting for opponent: {opponentChar}
			{/if}
		</p>
		{#if $winner}
			<button
				class="flex items-center gap-4 mx-auto bg-fuchsia-500 opacity-60 w-min px-6 py-4 text-white rounded-lg font-bold text-2xl transition-transform cursor-not-allowed enabled"
				on:click={() => game.reset()}
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
		font-size: calc(min(64px, 10vw) / 3);
	}
	.big {
		font-size: calc(min(64px, 10vw));
	}

	.activeSubGrid {
		opacity: 1;
		/* position: absolute;
		width: auto;
		inset: 10%;
		z-index: 1; */
	}
</style>
