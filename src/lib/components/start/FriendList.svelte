<script lang="ts">
	import { friendList, FriendPool, type User } from '$lib/api/FriendsPool';
	import Icon from '@iconify/svelte';

	FriendPool.Configure();

	function connect(friend: User) {
		FriendPool.connect(friend);
	}

	function remove(friend: User) {
		$friendList = $friendList.filter((f) => f.uuid != friend.uuid);
		FriendPool.stop();
	}
</script>

<div class="wrapper">
	<h3>Friends:</h3>
	<table>
		{#each $friendList as friend}
			<tr>
				<td>{friend.username}</td>

				<td class="flex justify-end gap-2">
					{#if friend.status == 'online'}
						<button on:click={() => connect(friend)}>
							Connect
							<Icon class="icon" icon="fluent:plug-connected-add-20-filled" title="connect" />
						</button>
					{:else}
						<button class="offline cursor-not-allowed">
							Offline
							<Icon class="icon" icon="fluent:plug-disconnected-24-filled" title="connect" />
						</button>
					{/if}
					<button class="remove" on:click={() => remove(friend)}>
						<Icon class="icon" icon="fluent:people-team-delete-24-filled" />
					</button>
				</td>
			</tr>
		{:else}
			<p>Connect and click on the name of you opponent to add it as a friend.</p>
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
		border-radius: 4px;
		background: rgb(50, 176, 50);
	}
	button.offline {
		background: rgb(218, 63, 63);
	}
	button.remove {
		background: rgb(165, 32, 32);
		padding: 0.125em;
	}
</style>
