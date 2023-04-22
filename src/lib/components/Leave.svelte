<script lang="ts">
	import { goto } from '$app/navigation';
	import { currentConnection } from '$lib/api/connection';
	import Icon from '@iconify/svelte';

	function leave() {
		goto('/play');
		$currentConnection?.send({
			type: 'gameSelection.left',
		});
	}

	$currentConnection?.on('gameSelection.left', () => {
		goto('/play');
	});
</script>

<button on:click={leave} class="absolute top-1 right-1 bg-slate-800 rounded p-2 text-white">
	<Icon icon="mdi:home" />
</button>
