<script>
	import { friendList, FriendPool } from '$lib/api/FriendsPool';
	import Icon from '@iconify/svelte';

	FriendPool.Configure();
</script>

<div class="wrapper">
	<h3>Friends:</h3>
	<table>
		{#each $friendList as friend}
			<tr>
				<td>{friend.username}</td>

				<td>
					{#if friend.status == 'online'}
						<button>
							Connect
							<Icon class="icon" icon="fluent:plug-connected-add-20-filled" title="connect" />
						</button>
					{:else}
						<button class="offline">
							Offline
							<Icon class="icon" icon="fluent:plug-disconnected-24-filled" title="connect" />
						</button>
					{/if}
				</td>
			</tr>
		{/each}
	</table>
</div>

<style>
	.wrapper {
		padding: 0 5rem;
		color: white;
	}

	h3 {
		font-size: 2rem;
		font-weight: bold;
	}

	table {
		width: 100%;
		margin: 1em;
	}

	button {
		display: flex;
		gap: 0.5em;
		align-items: center;
		padding: 0.125em 0.5em;
		background: green;
		border-radius: 4px;
		margin-left: auto;
	}
	button.offline {
		background: red;
	}
</style>
