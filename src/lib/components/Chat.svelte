<script lang="ts">
	import Icon from '@iconify/svelte';

	import { browser } from '$app/env';
	import { currentConnection } from '$lib/api/connection';
	import { gameList, type GameInfo } from '$lib/games/GameList';
	import { goto } from '$app/navigation';
	import { chatOpen, log, type GameProposition, type Message } from '$lib/stores/ChatLog';

	let message = '';

	if (browser) {
		$currentConnection?.on('message', (newMessage) => {
			$chatOpen = true;
			$log = [
				...$log,
				{
					from: 'Opponent',
					type: 'message',
					text: newMessage.data as string,
				},
			];
		});
		$currentConnection?.on('gameSelection.accept', ({ url }) => {
			$chatOpen = false;
			$log = [];
			goto(url);
		});
		$currentConnection?.on('gameSelection.propose', ({ url }) => {
			const game = gameList.find((g) => g.url == url);
			if (!game) throw new Error('Received inexistent game');

			$chatOpen = true;
			$log = [
				...$log,
				{
					type: 'game',
					from: 'Opponent',
					game,
				},
			];
		});
	}

	function openGame(e: Message | GameProposition) {
		const game = (e as GameProposition).game;

		$chatOpen = false;
		$currentConnection?.send({
			type: 'gameSelection.accept',
			url: game.url,
		});
		$log = [];
		goto(game.url);
	}

	function send() {
		$currentConnection?.send({
			type: 'message',
			data: message,
		});
		$log = [
			...$log,
			{
				from: 'You',
				type: 'message',
				text: message,
			},
		];

		message = '';
	}
</script>

<div
	class="fixed z-20 h-full w-60 flex flex-col transition-all transform opacity-95"
	class:shrunk={!$chatOpen}
>
	<button
		title="close"
		class="absolute top-2 bg-slate-700 rounded text-white delay-200 right-0 translate-x-full p-2 rounded-l-none"
		class:closed={!$chatOpen}
		on:click={() => ($chatOpen = !$chatOpen)}
	>
		{#if $chatOpen}
			<!-- content here -->
			<Icon icon="heroicons-outline:x" />
		{:else}
			<Icon icon="heroicons-outline:chat" />
		{/if}
	</button>
	<ol class="text-white grow overflow-y-auto bg-slate-700  p-2 gap-1">
		{#each $log as element}
			{#if element.type == 'message'}
				<li class="w-full break-words "><b>{element.from}</b>: {element.text}</li>
			{:else if element.type == 'game'}
				<li class="w-full bg-slate-800 rounded overflow-hidden my-2">
					<div class="flex gap-4 p-2 items-center">
						<img src={element.game.imageURL} alt="thumbnail" class="w-16 h-16 rounded shrink-0" />

						<p class="font-bold text-center grow">{element.game.name}</p>
					</div>
					{#if element.from == 'You'}
						<button
							class="w-full bg-slate-900 text-center py-2"
							on:click={() => openGame(element)}
							disabled>Waiting for Opponent</button
						>
					{:else}
						<button class="w-full bg-slate-900 text-center py-2" on:click={() => openGame(element)}
							>Join</button
						>
					{/if}
				</li>
			{/if}
		{/each}
	</ol>
	<form on:submit|preventDefault={send} class="flex h-10">
		<input
			type="text"
			bind:value={message}
			placeholder="Enter message"
			class="grow border-none bg-slate-600 text-white"
			disabled={!$currentConnection}
		/>
		<button
			class="p-2 bg-slate-800 text-white w-10 grid place-items-center"
			disabled={!$currentConnection}
		>
			<Icon icon="heroicons-outline:paper-airplane" />
		</button>
	</form>
</div>

<style lang="postcss">
	.closed {
		@apply shadow;
	}
	.shrunk {
		@apply -ml-60 opacity-50 hover:opacity-100;
	}

	:disabled {
		opacity: 0.5;
	}
</style>
