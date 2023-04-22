<script lang="ts">
	import FriendPopup from '$lib/components/FriendPopup.svelte';
	import SocialRow from '$lib/components/SocialRow.svelte';
	import { currentConnection } from '$lib/api/connection';
	import { gameList, type GameInfo } from '$lib/games/GameList';
	import { chatOpen, log } from '$lib/stores/ChatLog';

	function propose(game: GameInfo) {
		$log = [
			...$log,
			{
				type: 'game',
				game,
				from: 'You',
			},
		];
		$chatOpen = true;
		$currentConnection?.send({
			type: 'gameSelection.propose',
			url: game.url,
		});
	}
</script>

<div class="grow">
	<SocialRow />
	<FriendPopup />
	<h2 class="text-white text-5xl text-center m-8 font-bold">Choose a game:</h2>

	<div class="flex gap-8 justify-center flex-wrap w-screen">
		{#each gameList as game}
			<button on:click={() => propose(game)} class="block">
				<div class="w-48 h-full rounded-md overflow-hidden bg-slate-700 cursor-pointer">
					<img src={game.imageURL} alt={game.name} class="w-full" />
					<h3 class="text-center text-2xl font-semibold py-3 px-8  text-white">
						{game.name}
					</h3>
				</div>
			</button>
		{/each}
	</div>
</div>
