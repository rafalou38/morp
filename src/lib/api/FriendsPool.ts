import type PeerCls from 'peerjs';

import { nanoid } from 'nanoid';
import { Peer, PeerLoaded } from './peerjs';

import { P2PId } from '.';
import { get, writable } from 'svelte/store';
import { Connection, currentConnection } from './connection';
import { randomUsername } from './RadomWords';
import { goto } from '$app/navigation';

interface User {
	uuid: string;
	username: string | null;
	friend?: boolean;
}

export const userInfo = writable<User | null>(null);
export const opponentInfo = writable<User | null>(null);

export class FriendPool {
	static peer: PeerCls;
	static friends: User[];
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
						uuid: old?.uuid || nanoid(),
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
				friend: !!this.friends.find((user) => user.uuid == uuid),
			});
		});
		con.on('social.validateFriend', () => {
			this.addFriend();
		});

		const sendData = () => {
			const data = get(userInfo);
			if (data) {
				con.send({
					type: 'social.userInfo',
					username: data.username,
					uuid: data.uuid,
				});
			}
		};
		sendData();

		userInfo.subscribe(sendData);
	}

	static save() {
		const data = get(userInfo);
		if (data) {
			localStorage.setItem('FriendPool.uuid', data.uuid);
			if (data?.username) {
				localStorage.setItem('FriendPool.username', data.username);
			}
		}
	}

	static askFriendship() {
		const con = get(currentConnection);
		if (!con) return goto('/');

		con.send({ type: 'social.askFriend' });
	}
	static validateFriendship() {
		const con = get(currentConnection);
		if (!con) return goto('/');

		this.addFriend();
		con.send({ type: 'social.validateFriend' });
	}

	private static addFriend() {
		const other = get(opponentInfo);
		if (other) {
			this.friends.push({ ...other, friend: true });
			localStorage.setItem('FriendPool.friends', JSON.stringify(this.friends));
			opponentInfo.update((op) => {
				if (op) op.friend = true;
				return op;
			});
		}
	}
}
