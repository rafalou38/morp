<script lang="ts">
	import { currentConnection } from '$lib/api/connection';
	import { FriendPool, opponentInfo, userInfo } from '$lib/api/FriendsPool';
	import { randomUsername } from '$lib/api/RadomWords';
	import Icon from '@iconify/svelte';
	import FriendList from './start/FriendList.svelte';

	const focus = (e: HTMLInputElement) => e.focus();

	async function generate(e: MouseEvent) {
		if (!$userInfo) return;

		$userInfo.username = 'loading';
		editing = false;
		$userInfo.username = await randomUsername();
		$userInfo.username = $userInfo.username?.toLowerCase() || null;
	}

	const connected = !!$currentConnection;
	let editing = false;
</script>

<svelte:body on:click={() => (editing = false)} />
<div class="row" class:connected>
	{#if connected}
		{#if $userInfo}
			{#if editing}
				<div class="capsize-dosis-12 cell">
					<input type="text" use:focus bind:value={$userInfo.username} />
					<button on:click={generate}>
						<Icon class="icon" icon="fluent:arrow-repeat-all-24-filled" />
					</button>
				</div>
			{:else}
				<div class="cell">
					<div class="username" title="Edit" on:click|stopPropagation={() => (editing = true)}>
						<p class="capsize-dosis-12">{$userInfo.username || 'Loading'}</p>
						<Icon class="icon" icon="fluent:edit-28-filled" />
					</div>
				</div>
			{/if}
		{:else}
			<p class="capsize-dosis-12">Loading</p>
		{/if}
		<div class="cell">
			{#if $opponentInfo}
				<div
					class="username"
					title="Add friend"
					on:click={() => {
						if ($opponentInfo?.friend) FriendPool.askRemoveFriend();
						else FriendPool.askFriendship();
					}}
				>
					<p class="capsize-dosis-12" class:underline={$opponentInfo.friend}>
						{$opponentInfo.username || 'Loading'}
					</p>
					{#if !$opponentInfo.friend}
						<Icon class="icon" icon="fluent:people-add-24-filled" />
					{:else}
						<Icon class="icon" icon="fluent:people-team-delete-24-filled" />
					{/if}
				</div>
			{:else}
				Loading
			{/if}
		</div>
	{:else}
		<a class="connect-btn" href="/start">
			<p class="not-connected capsize-dosis-12">Not connected</p>
			<Icon class="icon" icon="fluent:plug-disconnected-28-filled" title="connect" />
		</a>
	{/if}
</div>

<style lang="postcss">
	.cell {
		width: 50%;
		height: 100%;
		display: flex;
		gap: 0.5em;
		justify-content: center;
		align-items: center;
	}
	.row {
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: space-around;
		color: white;
		background: #e74c3c;
		&.connected {
			background: #334155;
		}
	}
	input {
		background: #2d3a4c;
		box-sizing: border-box;
		padding: 0 0.5em;
		border: none;
	}
	input:focus {
		outline: none;
		border: none;
		box-shadow: none;
	}
	.username {
		opacity: 0.85;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;

		:global(.icon) {
			transition: all 250ms ease;
			transform: translateX(-100%);
			opacity: 0;
			font-size: 0.75rem;
		}
		&:hover {
			opacity: 1;
			:global(.icon) {
				transform: translateX(0);
				opacity: 1;
			}
		}
	}
	.self {
	}
	.not-connected {
		text-align: center;
	}

	.connect-btn {
		display: flex;
		align-items: center;
		gap: 1rem;
		opacity: 0.85;

		&:hover {
			opacity: 1;
		}
	}
</style>
