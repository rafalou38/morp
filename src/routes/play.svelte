<script>
	import { browser } from '$app/env';

	import { goto } from '$app/navigation';

	import { currentGame } from '$lib/api/game';

	let message = '';
	let messages = [];
	if (!$currentGame && browser) {
		goto('start');
	} else if (browser) {
		$currentGame.on('message', (newMessage) => {
			messages = [
				...messages,
				{
					author: $currentGame.peer.id,
					content: newMessage.data
				}
			];
		});
	}

	function send() {
		$currentGame.send({
			type: 'message',
			data: message
		});
		messages = [
			...messages,
			{
				author: 'You',
				content: message
			}
		];

		message = '';
	}
</script>

Connected to: {$currentGame?.peer.id}
<br />
<form on:submit|preventDefault={send}>
	<input type="text" bind:value={message} />
	<button class="px-4 py-2 bg-blue-800 text-white font-bold" type="submit">send</button>
</form>

<ol class="text-white">
	{#each messages as { author, content }}
		<li><b>{author}</b>: {content}</li>
	{/each}
</ol>
