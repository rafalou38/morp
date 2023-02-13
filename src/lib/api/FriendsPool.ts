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
	status?: 'offline' | 'online';
}

export const friendList = writable<User[]>([]);
export const userInfo = writable<User | null>(null);
export const opponentInfo = writable<User | null>(null);

export class FriendPool {
	static peer: PeerCls;
	private static loaded = false;
	static async Configure() {
		if (this.loaded) return;
		this.loaded = true;
		await PeerLoaded;
		if (!Peer) throw new Error('PeerJs not loaded');

		const friendsRaw = localStorage.getItem('FriendPool.friends');
		if (friendsRaw) {
			friendList.set(
				JSON.parse(friendsRaw).map((friend: User) => ({
					...friend,
					status: 'offline',
				}))
			);
		}

		userInfo.subscribe(this.save.bind(this));
		friendList.subscribe(this.save.bind(this));
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

		if (uuid) {
			console.log('Making peer', P2PId('friend', uuid));

			const receiving = new Peer(P2PId('friend', uuid));

			const tryConnect = (friendUUID: string) => {
				console.log('Fetching', friendUUID);
				const con = receiving.connect(P2PId('friend', friendUUID));

				con.on('open', () => {
					console.log('Success!', friendUUID);
					friendList.update((old) =>
						old.map((f) => {
							if (f.uuid == friendUUID)
								return {
									...f,
									status: 'online',
								};
							else return f;
						})
					);
				});
				con.on('error', (e) => console.log('error', e.toString()));
			};

			receiving.on('open', () => {
				console.log('connection opened');

				for (const friend of get(friendList)) {
					tryConnect(friend.uuid);
				}
			});

			receiving.on('error', (err) => {
				const failedUUID = (err.toString() as string).match(/[a-zA-Z\d]{21}/)?.[0];
				if (failedUUID) {
					tryConnect(failedUUID);
				}
			});
		}
	}
	static setupListeners(con: Connection) {
		con.on('social.userInfo', ({ username, uuid }) => {
			console.log('[Friend] Received opponent info');
			opponentInfo.set({
				username,
				uuid,
				friend: !!get(friendList).find((user) => user.uuid == uuid),
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

		localStorage.setItem('FriendPool.friends', JSON.stringify(get(friendList)));
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
			friendList.update((old) => [...old, { ...other, friend: true }]);
			opponentInfo.update((op) => {
				if (op) op.friend = true;
				return op;
			});
		}
	}
}
