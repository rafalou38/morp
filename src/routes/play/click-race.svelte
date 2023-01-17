<script>
	import Icon from '@iconify/svelte';

	let selfProgress = 0;
	let opponentProgress = 0;

	function btnClicked() {
		selfProgress++;
		console.log(selfProgress);
		updateDisplay();
	}

	function updateDisplay() {
		document.getElementById('p1').style.marginLeft = selfProgress + '%';
	}
</script>

<div class="field">
	<div id="endLine" />

	<div class="player" id="p1"><Icon icon="uil:car-sideview" /></div>
	<div class="player" id="p2"><Icon icon="uil:car-sideview" /></div>
</div>

<button on:click={btnClicked}><Icon icon="mdi:target" /></button>

<style>
	.field {
		padding: 0.5em 1.5rem;
		padding-right: calc(72px + 1.5em);
		background: #27ae60;
		position: relative;
		background: url(/images/grass.jpg);
		background-size: 450px;
		border-radius: 5px;
	}
	.player {
		position: relative;
		z-index: 10;
		padding: 1rem;
		margin: 1rem 0;
		border-radius: 100%;
		font-size: 40px;
		color: white;
		width: max-content;

		transition: margin-left 100ms linear;
	}
	#p1 {
		background: #3498db;
	}
	#p2 {
		background: #8e44ad;
	}
	button {
		padding: 1.5rem;
		aspect-ratio: 1/1;
		font-size: 8em;

		width: max-content;
		margin: 0 auto;
		background-color: #3498db;
		border: 8px solid white;
		color: white;
		border-radius: 100%;

		transition: transform 0.5s ease;
	}

	button:hover {
		transform: scale(1.05);
	}
	button:active {
		transition-duration: 100ms;
		transform: scale(1.02);
	}

	#endLine {
		position: absolute;
		z-index: 0;
		right: calc(72px / 2 + 1.5em);
		top: 0;
		height: 100%;
		widows: 0px;
		border: 2px dashed #e74c3c;
	}
</style>
