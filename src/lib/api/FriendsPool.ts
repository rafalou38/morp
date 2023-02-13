import type PeerCls from 'peerjs';

import { nanoid } from 'nanoid';
import { Peer, PeerLoaded } from './peerjs';

import { P2PId } from '.';
import { get, writable } from 'svelte/store';
import { Connection, currentConnection } from './connection';
import { randomUsername } from './RadomWords';

export const userInfo = writable<{ uuid: string | null; username: string | null }>({
	uuid: null,
	username: null,
});
export const opponentInfo = writable<{ uuid: string | null; username: string | null }>({
	uuid: null,
	username: null,
});

export class FriendPool {
	static peer: PeerCls;
	static friends: string[];
	private static loaded = false;
	static async Configure() {
		if (this.loaded) return;
		await PeerLoaded;
		if (!Peer) throw new Error('PeerJs not loaded');

		const friendsRaw = localStorage.getItem('FriendPool.friends');
		if (friendsRaw) {
			this.friends = JSON.parse(friendsRaw);
		} else {
			this.friends = [];
		}

		userInfo.subscribe(this.save.bind(this));
		const uuid = localStorage.getItem('FriendPool.uuid') || nanoid();
		const username = localStorage.getItem('FriendPool.username');
		userInfo.set({
			uuid,
			username,
		});

		if (!username)
			randomUsername().then((v) => {
				if (v)
					userInfo.update((old) => ({
						...old,
						username: v,
					}));
			});

		this.loaded = true;
		const cc = get(currentConnection);
		if (!cc) return;
	}
	static setupListeners(con: Connection) {
		con.on('social.userInfo', ({ username, uuid }) => {
			console.log('[Friend] Received opponent info');
			opponentInfo.set({
				username,
				uuid,
			});
		});

		const sendData = () => {
			con.send({
				type: 'social.userInfo',
				username: get(userInfo).username,
				uuid: get(userInfo).uuid,
			});
		};
		sendData();

		userInfo.subscribe(sendData);
	}

	static save() {
		const { uuid, username } = get(userInfo);
		if (uuid) localStorage.setItem('FriendPool.uuid', uuid);
		if (username) localStorage.setItem('FriendPool.username', username);
	}
}
