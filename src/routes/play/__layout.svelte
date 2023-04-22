<script>
	import Chat from '$lib/components/Chat.svelte';
	import { page } from '$app/stores';
	import Leave from '$lib/components/Leave.svelte';
</script>

<div class="flex h-full">
	<Chat />
	<div class="flex flex-col grow h-full">
		<slot />
	</div>

	{#if $page.routeId != 'play'}
		<Leave />
	{/if}
</div>
