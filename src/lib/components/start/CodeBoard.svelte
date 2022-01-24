<script lang="ts">
	import { randomCode } from '$lib/utils/gameCode';

	export let code = randomCode();
	let parts: boolean[][] = [];

	$: parts = new Array(3)
		.fill([])
		.map((_, y) => new Array(3).fill('').map((__, x) => code[y * 3 + x] === '1'));
</script>

<div class="flex flex-col gap-1 bg-gray-600">
	{#each parts as row, y}
		<div class="flex gap-1">
			{#each row as cell, x}
				<div
					class="w-20 h-20 bg-slate-500 cursor-pointer hover:bg-slate-400"
					class:active={cell}
					on:click={() => {
						parts[y][x] = !parts[y][x];
						code = parts.map((row) => row.map((c) => (c ? '1' : '0')).join('')).join('');
					}}
				/>
			{/each}
		</div>
	{/each}
</div>

<style lang="postcss">
	.active {
		@apply bg-slate-300;
	}
</style>
