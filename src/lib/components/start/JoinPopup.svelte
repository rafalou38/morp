<script lang="ts">
	import CodeBoard from './CodeBoard.svelte';

	let resolve: (value: string) => void;
	let code = '000000000';

	export function getCode() {
		return new Promise((resolve_) => {
			resolve = resolve_;
		});
	}

	function submit(valid: boolean) {
		if (valid) {
			resolve(code);
		} else {
			resolve('');
		}
		resolve = null;
	}
</script>

<div
	class="absolute z-10 inset-0 bg-black/30 grid place-items-center opacity-0 pointer-events-none "
	class:shown={resolve}
	on:click={submit.bind(null, false)}
>
	<div
		class="flex flex-col items-center gap-16 opacity-0 pointer-events-none w-full sm:max-w-md max-w-none h-full sm:h-auto transition-all bg-slate-600 overflow-hidden rounded-none sm:rounded-lg"
		class:shown={resolve}
		on:click|stopPropagation={() => {}}
	>
		<h3 class="mt-8 text-5xl font-bold text-white text-center">Enter game code.</h3>
		<div class="flex items-center grow sm:grow-0">
			<CodeBoard bind:code />
		</div>
		<button
			on:click={submit.bind(null, true)}
			class="w-full h-32 bg-slate-700 text-4xl font-bold text-white">Submit</button
		>
	</div>
</div>

<style lang="postcss">
	.shown {
		@apply opacity-100 pointer-events-auto;
	}
</style>
