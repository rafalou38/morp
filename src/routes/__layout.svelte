<script lang="ts">
	import { pressedKeys } from '$lib/utils/input';
	import '../app.css';

	function keydown(e: KeyboardEvent) {
		if (e.repeat) return;
		pressedKeys.add(e.key);
	}
	function keyup(e: KeyboardEvent) {
		pressedKeys.delete(e.key);
	}
</script>

<svelte:body on:keydown={keydown} on:keyup={keyup} />

<slot />
