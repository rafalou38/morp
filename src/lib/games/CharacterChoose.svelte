<script lang="ts">
	import { browser } from '$app/env';

	import { currentConnection } from '$lib/api/connection';

	import Icon from '@iconify/svelte';
	import GraphemeSplitter from 'grapheme-splitter';
	import { onMount } from 'svelte';
	const splitter = new GraphemeSplitter();

	let base_characters = ['❌', '⭕', '🟢', '🟦', '🟩'];
	export let opponent = '';
	export let chosenCharacter = '';
	export let state: null | 'waiting OP' | 'OP waiting' | 'started' = null;
	$: chosenCharacter = splitter.splitGraphemes(chosenCharacter)[0] || '';
	$: sendChar(chosenCharacter);

	onMount(() => {
		chosenCharacter = localStorage.getItem('lastCharacterChosen') || '';
		sendChar(chosenCharacter);
	});

	if (browser) {
		$currentConnection?.on('charChosen', ({ data: opponentChar_ }) => {
			opponent = opponentChar_ as string;
			console.log("received opponent's character", opponentChar_);
		});
	}
	function sendChar(char: string) {
		if (!browser) return;
		if (char) localStorage.setItem('lastCharacterChosen', char);
		$currentConnection?.send({
			type: 'charChosen',
			data: char
		});
	}
</script>

<div class="px-8 py-8">
	<div class="flex justify-around">
		<div>
			<p class="text-white text-2xl pb-2">Start by choosing a character.</p>
			<div class="flex gap-2 py-11 px-4">
				{#each base_characters as character}
					<button
						class="w-16 h-16 bg-slate-500 rounded-full grid place-items-center transition-transform hover:scale-105"
						on:click={() => (chosenCharacter = character)}
					>
						{character}
					</button>
				{/each}
			</div>
			<p class="text-white text-2xl pb-2">Or a custom one.</p>
			<div class="py-11 px-4">
				<div class="flex">
					<input
						type="text"
						placeholder="Enter emoji"
						class="bg-slate-500 w-24 placeholder-white/60 text-white"
						bind:value={chosenCharacter}
					/>
					<button class="bg-slate-700 w-11 grid place-items-center text-white text-lg"
						><Icon icon="heroicons-outline:emoji-happy" /></button
					>
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-8">
			<div>
				<div
					class="w-40 h-40 bg-slate-500 rounded-full grid place-items-center text-6xl border-fuchsia-500 transition-all border-0"
					class:ready={state === 'OP waiting'}
				>
					{opponent}
				</div>
				<p class="text-white text-2xl text-center pt-2">Opponent</p>
			</div>
			<div>
				<div
					class="w-40 h-40 bg-slate-500 rounded-full grid place-items-center text-6xl border-fuchsia-500 transition-all border-0"
					class:ready={state === 'waiting OP'}
				>
					{chosenCharacter}
				</div>
				<p class="text-white text-2xl text-center pt-2">You</p>
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.ready {
		@apply border-8;
	}
</style>
