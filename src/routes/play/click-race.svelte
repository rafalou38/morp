<script>
	import { currentConnection } from '$lib/api/connection';

	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	const START_DELAY = 5; //s

	let selfProgress = 0;
	let opponentProgress = 0;

	/** @type {"starting" | "started" | "ended"}*/
	let gameState = 'ended';

	// Holds the value to show inside of the counter
	let timeDisplay = '';

	function mainBtnClicked() {
		if (gameState === 'starting') {
			//  Countdown
			// Don't do anything
			return;
		} else if (gameState === 'started') {
			// Quand le jeu est d
			// Register the click
			selfProgress++;
			$currentConnection.send({
				type: 'cr-click',
				v: selfProgress
			});
			updateDisplay();
		} else if (gameState === 'ended') {
			//  Quand le button est cliqué et que le jeu est terminé
			// Debut du jeu a la date actuelle
			startGame(new Date());
		}
	}

	function startGame(timestamp, remote = false) {
		selfProgress = 0;
		opponentProgress = 0;
		gameState = 'starting';
		updateDisplay();

		const start = new Date(timestamp);

		if (!remote) {
			// Quand le jeu est démarré de ce coté, on envoie l'event start
			$currentConnection.send({
				type: 'cr-start',
				time: start.getTime()
			});
		}

		// Gestion du counter
		const interval = setInterval(() => {
			const msElapsed = new Date() - start;
			const secElapsed = msElapsed / 1000;
			if (secElapsed >= START_DELAY) {
				gameState = 'started';
				clearInterval(interval);
			} else {
				timeDisplay = (START_DELAY - Math.round(secElapsed)).toString();
			}
		}, 100);
	}

	function updateDisplay() {
		document.getElementById('p1').style.marginLeft = selfProgress + '%';
		document.getElementById('p2').style.marginLeft = opponentProgress + '%';

		if (selfProgress >= 100 || opponentProgress >= 100) {
			gameState = 'ended';
		}
	}

	onMount(() => {
		// Une fois que la page est prête, tou est chargé

		$currentConnection?.on('cr-start', ({ time }) => {
			// On démarre le jeu en mode remote
			// console.debug(`[click-race] game started from remote at ${time}`);

			startGame(time, true);
		});
		$currentConnection?.on('cr-click', ({ v }) => {
			// On démarre le jeu en mode remote
			// console.debug(`[click-race] receive opponent clicks ${v}`);

			opponentProgress = v;
			updateDisplay();
		});
	});
</script>

<div class="p-8 flex flex-col grow gap-16">
	<div class="field">
		<div id="endLine" />

		<div class="player" id="p1"><Icon icon="uil:car-sideview" /></div>
		<div class="player" id="p2"><Icon icon="uil:car-sideview" /></div>
	</div>

	<!--
		On affiche un bouton different en fonction de l'état du jeu.
	 -->
	{#if gameState == 'starting'}
		<button id="main-btn" class="btn-starting" on:click={mainBtnClicked}>
			<div class="counter">{timeDisplay}</div>
		</button>
		<!--
	
	 -->
	{:else if gameState == 'started'}
		<button id="main-btn" class="btn-started" on:click={mainBtnClicked}>
			<Icon class="text-9xl" icon="mdi:target" />
		</button>
		<!--
	
		 -->
	{:else if gameState == 'ended'}
		<button id="main-btn" class="btn-ended" on:click={mainBtnClicked}>
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
</div>

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
