<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = async function ({ params, url }) {
		const gameCode = url.searchParams.get('code');

		if (!gameCode) return { redirect: '/start', status: 307 };

		return {
			status: 200,
			props: {
				gameCode
			}
		};
	};
</script>

<script lang="ts">
	import { isInUse } from '$lib/api/game/code';

	export let gameCode: string;

	isInUse(gameCode);
</script>

<label for="gameCode">Your gameCode</label>
<input id="gameCode" type="text" readonly value={gameCode} />
