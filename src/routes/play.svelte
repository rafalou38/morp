<script>
	import { browser } from '$app/env';

	import { goto } from '$app/navigation';

	import { currentGame } from '$lib/api/game';
	import Chat from '$lib/components/Chat.svelte';

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

<div class="flex h-full">
	<Chat />
	<div class="grow">
		Connected to: {$currentGame?.peer.id}
	</div>
</div>
