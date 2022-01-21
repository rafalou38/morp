<script lang="ts">
	let resolve: (value: string) => void;
	let code = '';

	export function getCode() {
		return new Promise((resolve_) => {
			resolve = resolve_;
		});
	}

	function submit() {
		resolve(code);
	}
</script>

<div
	class="absolute inset-0 bg-black/30 grid place-items-center  opacity-0 pointer-events-none"
	class:shown={resolve}
>
	<div class="opacity-0 pointer-events-none transition-all bg-slate-600" class:shown={resolve}>
		<h3>Enter the code of the host.</h3>
		<input type="text" />
		<button on:click={submit}>Submit</button>
	</div>
</div>

<style lang="postcss">
	.shown {
		@apply opacity-100 pointer-events-auto;
	}
</style>
