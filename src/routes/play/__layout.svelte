<script>
	import Chat from '$lib/components/Chat.svelte';
</script>

<div class="flex h-full">
	<Chat />
	<div class="flex flex-col grow h-full p-8 gap-16">
		<slot />
	</div>
</div>
