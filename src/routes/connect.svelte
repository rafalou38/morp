<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async function ({ params, url }) {
		if (!browser) {
			return {
				status: 200,
				props: {
					gameCode: '',
					hosted: false
				}
			};
		}
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
	import { currentConnection, Connection } from '$lib/api/connection';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { PeerLoaded } from '$lib/api/peerjs';
	import CodeBoard from '$lib/components/start/CodeBoard.svelte';
	import { browser } from '$app/env';

	export let gameCode: string;
	export let hosted: boolean;
	let connected = false;
	let error: string | null = null;

	onMount(async () => {
		await PeerLoaded;
		currentConnection.set(
			new Connection(
				gameCode,
				hosted,
				() => {
					connected = true;
					setTimeout(() => {
						goto('/play');
					}, 500);
				},
				() => {
					error = 'Connection failed';
				}
			)
		);
	});
</script>

<div class="h-full flex flex-col items-center justify-center gap-40">
	{#if connected}
		<h2 class="text-white text-8xl font-bold text-center">Connected !</h2>
	{:else if error}
		<h2 class="text-white text-8xl font-bold text-center">Failed to connect.</h2>
	{:else if hosted}
		<h2 class="text-white text-8xl font-bold text-center">Waiting for opponent...</h2>
		<div class="">
			<CodeBoard code={gameCode} noInteraction />
			<p class="text-white text-center font-semibold mt-2">Your code.</p>
		</div>
	{:else}
		<h2 class="text-white text-8xl font-bold text-center">Connecting to your opponent...</h2>
	{/if}
</div>
