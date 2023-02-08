<script lang="ts">
	import Icon from '@iconify/svelte';

	import { browser } from '$app/env';
	import { currentConnection } from '$lib/api/connection';

	type Message = {
		from: 'You' | 'Opponent';
		text: string;
	};
	let messages: Message[] = [];
	let message = '';
	let open = false;

	if (browser) {
		$currentConnection?.on('message', (newMessage) => {
			open = true;
			messages = [
				...messages,
				{
					from: 'Opponent',
					text: newMessage.data as string
				}
			];
		});
	}

	function send() {
		$currentConnection.send({
			type: 'message',
			data: message
		});
		messages = [
			...messages,
			{
				from: 'You',
				text: message
			}
		];

		message = '';
	}
</script>

<div class="relative h-full w-60 flex flex-col transition-all transform" class:shrunk={!open}>
	<button
		title="close"
		class="absolute right-2 top-2 p-1 hover:bg-slate-700 rounded text-white delay-200 transition-transform"
		class:closed={!open}
		on:click={() => (open = !open)}
	>
		{#if open}
			<!-- content here -->
			<Icon icon="heroicons-outline:x" />
		{:else}
			<Icon icon="heroicons-outline:chat" />
		{/if}
	</button>
	<ol class="text-white grow overflow-y-auto bg-slate-700  p-2 gap-1">
		{#each messages as { from, text }}
			<li class="w-full break-words "><b>{from}</b>: {text}</li>
		{/each}
	</ol>
	<form on:submit|preventDefault={send} class="flex h-10">
		<input
			type="text"
			bind:value={message}
			placeholder="Enter message"
			class="grow border-none bg-slate-600 text-white"
		/>
		<button class="p-2 bg-slate-800 text-white w-10 grid place-items-center">
			<Icon icon="heroicons-outline:paper-airplane" />
		</button>
	</form>
</div>

<style lang="postcss">
	.closed {
		@apply bg-slate-800 rounded-l-none right-0 translate-x-full p-2 shadow;
	}
	.shrunk {
		@apply -ml-60 opacity-50 hover:opacity-100;
	}
</style>
