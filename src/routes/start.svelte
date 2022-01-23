<script lang="ts">
	import { goto } from '$app/navigation';
	import { createGame } from '$lib/api/game/play';
	import JoinPopup from '$lib/components/start/JoinPopup.svelte';
	import { randomCode } from '$lib/utils/gameCode';

	async function host() {
		const code = await createGame();
		goto('/play/?code=' + code);
	}
	async function join() {
		waitingCode = true;
		const code = await EJoinPopup.getCode();
		if (code) {
			goto('/play/?code=' + code);
		}
		waitingCode = false;
	}

	let EJoinPopup: JoinPopup;
	let waitingCode = false;
</script>

<JoinPopup bind:this={EJoinPopup} />

<div class="h-full flex flex-col " class:blur-sm={waitingCode}>
	<h2 class="text-white font-bold text-8xl text-center mt-16">Start a new game</h2>

	<div
		class="container mx-auto h-full mb-16 flex gap-8 flex-col sm:flex-row items-center justify-center sm:justify-around"
	>
		<button
			class="bg-slate-700 text-white px-16 py-8 rounded-lg text-5xl font-bold transform duration-500 transition-transform hover:scale-125"
			on:click={host}
		>
			Host
		</button>
		<button
			class="bg-slate-700 text-white px-16 py-8 rounded-lg text-5xl font-bold transform duration-500 transition-transform hover:scale-125"
			on:click={join}
		>
			Join
		</button>
	</div>
</div>
