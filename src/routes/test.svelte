<script lang="ts">
	const GAME = '/';
</script>

<div class="wrapper">
	<iframe src={GAME} frameborder="0" title="game-preview" />
	<iframe src={GAME} frameborder="0" title="game-preview" />
</div>

<style>
	.wrapper {
		display: flex;
		height: 100%;
	}

	iframe {
		width: 50%;
		height: 100%;
		border: 1px dashed white;
	}
</style>
