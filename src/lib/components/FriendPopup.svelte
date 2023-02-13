<script lang="ts">
	import { currentConnection } from '$lib/api/connection';
	import { FriendPool, opponentInfo } from '$lib/api/FriendsPool';
	import { onMount } from 'svelte';

	let shown = false;
	function accept() {
		shown = false;
		FriendPool.validateFriendship();
	}
	function reject() {
		shown = false;
	}

	onMount(() => {
		$currentConnection?.on('social.askFriend', () => (shown = true));
	});
</script>

<div
	class="absolute z-10 inset-0 bg-black/30 grid place-items-center opacity-0 pointer-events-none "
	class:shown
	on:click={reject}
>
	<div
		class="flex flex-col items-center gap-16 opacity-0 pointer-events-none w-full sm:max-w-md max-w-none h-full sm:h-auto transition-all bg-slate-600 overflow-hidden rounded-none sm:rounded-lg"
		class:shown
		on:click|stopPropagation={() => {}}
	>
		<h3 class="mt-8 text-5xl font-bold text-white text-center">Friend Request</h3>
		<p>From: <b>{$opponentInfo?.username}</b></p>

		<button on:click={accept} class="w-full h-32 bg-slate-700 text-4xl font-bold text-white"
			>Accept</button
		>
	</div>
</div>

<style lang="postcss">
	.shown {
		@apply opacity-100 pointer-events-auto;
	}

	p {
		color: white;
		font-size: 2rem;
		padding: 0 2rem;
		text-align: center;
	}
</style>
