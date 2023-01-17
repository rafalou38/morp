<script>
	import Icon from '@iconify/svelte';

	const START_DELAY = 5; //s

	let selfProgress = 0;
	let opponentProgress = 0;

	/** @type {"starting" | "started" | "ended"}*/
	let gameState = 'ended';

	// Holds the value to show inside of the counter
	let timeDisplay = '';

	function btnClicked() {
		if (gameState === 'starting') {
			//  Countdown
			// Don't do anything
			return;
		} else if (gameState === 'started') {
			//  When button clicked and game is started
			// Register the click
			selfProgress++;
			console.log(selfProgress);
			updateDisplay();

			if (selfProgress >= 100 || opponentProgress >= 100) {
				endGame();
			}
		} else if (gameState === 'ended') {
			//  When button clicked and game is ended
			// Start the game
			startGame();
		}
		console.log(gameState);
	}

	function startGame(remote = false) {
		selfProgress = 0;
		opponentProgress = 0;
		gameState = 'starting';

		// Handle the counter
		const start = new Date();
		const interval = setInterval(() => {
			const msElapsed = new Date() - start;
			const secElapsed = msElapsed / 1000;
			if (secElapsed >= START_DELAY) {
				console.log('here');
				gameState = 'started';
				clearInterval(interval);
			} else {
				timeDisplay = (START_DELAY - Math.round(secElapsed)).toString();
			}
		}, 100);
	}

	function endGame(remote = false) {
		gameState = 'ended';
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

{#if gameState == 'starting'}
	<button id="main-btn" class="btn-starting" on:click={btnClicked}>
		<div class="counter">{timeDisplay}</div>
	</button>
	<!-- 

 -->
{:else if gameState == 'started'}
	<button id="main-btn" class="btn-started" on:click={btnClicked}>
		<Icon class="text-9xl" icon="mdi:target" />
	</button>
	<!-- 

	 -->
{:else if gameState == 'ended'}
	<button id="main-btn" class="btn-ended" on:click={btnClicked}>
		<Icon class="text-9xl" icon="mdi:play" />
	</button>

	<div class="result">
		{#if opponentProgress > selfProgress}
			You lost 💀
		{:else if opponentProgress < selfProgress}
			You won 😃
		{/if}
	</div>
{/if}

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
	.result {
		font-weight: bold;
		font-size: 3rem;
		text-align: center;
		color: white;
	}
	button {
		position: relative;

		padding: 1.5rem;
		aspect-ratio: 1/1;
		min-width: 190px;

		width: max-content;
		margin: 0 auto;

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
	.btn-starting {
		background-color: #909497;
	}
	.btn-started {
		background-color: #3498db;
	}
	.btn-ended {
		background-color: #2ecc71;
	}
	.counter {
		font-size: 4em;
		font-weight: bold;
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}
	#endLine {
		position: absolute;
		z-index: 0;
		right: calc(72px / 2 + 1.5em);
		top: 0;
		height: 100%;
		widows: 0px;
		border: 2px dashed #000000;
	}
</style>
