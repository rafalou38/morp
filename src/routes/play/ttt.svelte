<script lang="ts">
	import { browser } from '$app/env';
	import { currentConnection } from '$lib/api/connection';

	import CharacterChoose from '$lib/games/CharacterChoose.svelte';
	import Icon from '@iconify/svelte';
	let state: null | 'waiting OP' | 'OP waiting' | 'started' = null;
	let char = '';
	let opponentChar = '';
	let gameReady = false;
	$: gameReady = char && opponentChar && char !== opponentChar && state !== 'waiting OP';

	let board: (null | 'X' | 'O')[][] = [
		[null, null, null],
		[null, null, null],
		[null, null, null]
	];

	function startGame() {
		$currentConnection.send({
			type: 'readyTTTGame'
		});
		if (state === 'OP waiting') state = 'started';
		else state = 'waiting OP';
	}

	if (browser) {
		$currentConnection?.on('readyTTTGame', () => {
			if (state == 'waiting OP') state = 'started';
			else state = 'OP waiting';
		});
	}
</script>

<h1 class="text-center font-bold text-5xl text-white pt-8">Tic-Tac-Toe</h1>
{#if state === 'started'}
	{#each board as row, y}
		<div class="row">
			{#each row as cell, x}
				<div
					class="cell"
					on:click={() => {
						if (board[y][x] === null) {
							board[y][x] = 'X';
						}
					}}
				>
					{cell}
				</div>
			{/each}
		</div>
	{/each}
{:else}
	<div class="flex flex-col grow pb-16">
		<div class="grow">
			<CharacterChoose bind:opponent={opponentChar} bind:chosenCharacter={char} {state} />
		</div>
		<button
			class="flex items-center gap-4 mx-auto bg-fuchsia-500 opacity-60 w-min px-6 py-4 text-white rounded-lg font-bold text-2xl transition-transform cursor-not-allowed"
			disabled={!gameReady}
			class:enabled={gameReady}
			on:click={startGame}
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
</style>
