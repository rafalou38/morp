<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async function ({ params, url }) {
		const gameCode = url.searchParams.get('code');
		const hosted = !!url.searchParams.get('hosted');

		if (!gameCode) return { redirect: '/start', status: 307 };

		return {
			status: 200,
			props: {
				gameCode,
				hosted
			}
		};
	};
</script>

<script lang="ts">
	import { currentGame, Game } from '$lib/api/game';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { PeerLoaded } from '$lib/api/peerjs';
	import CodeBoard from '$lib/components/start/CodeBoard.svelte';

	export let gameCode: string;
	export let hosted: boolean;
	let connected = false;

	onMount(async () => {
		await PeerLoaded;
		currentGame.set(
			new Game(gameCode, hosted, () => {
				connected = true;
				setTimeout(() => {
					goto('/play');
				}, 500);
			})
		);
	});
</script>

{#if connected}
	<h2>Connected !</h2>
{:else if hosted}
	<h2>Waiting for opponent...</h2>
	<CodeBoard code={gameCode} />
{:else}
	<h2>Connecting to your opponent...</h2>
{/if}
