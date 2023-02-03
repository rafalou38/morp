<script>
	import { onMount } from 'svelte';
	onMount(() => {
	import Stage from 'stage-js/platform/web';
		Stage({
			name: 'emoji',
			image: 'images/emoji.png'
		});

		Stage(function (stage) {
			stage.viewbox(700, 700);
			Stage.image('emoji').appendTo(stage).pin('handle', 0.5);
		});
	});
</script>
