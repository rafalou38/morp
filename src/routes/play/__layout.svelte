<script>
	import Chat from '$lib/components/Chat.svelte';
</script>

<div class="flex h-full">
	<Chat />
	<div class="flex flex-col grow h-full">
		<slot />
	</div>
</div>
