<script>
	import { browser } from '$app/env';

	import { goto } from '$app/navigation';

	import { currentConnection } from '$lib/api/connection';
	import Chat from '$lib/components/Chat.svelte';

	let message = '';
	let messages = [];
	if (!$currentConnection && browser) {
		goto('start');
	} else if (browser) {
		$currentConnection.on('message', (newMessage) => {
			messages = [
				...messages,
				{
					author: $currentConnection.peer.id,
					content: newMessage.data
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
		Connected to: {$currentConnection?.peer.id}
	</div>
</div>
