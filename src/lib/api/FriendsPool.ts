import type PeerCls from 'peerjs';

import { nanoid } from 'nanoid';
import { Peer, PeerLoaded } from './peerjs';

import { P2PId } from '.';
import { get, writable } from 'svelte/store';
import { Connection, currentConnection } from './connection';
import { randomUsername } from './RadomWords';
import { goto } from '$app/navigation';
import type { DataConnection } from 'peerjs';



/**
 * MyUUID < OtherUUID === HOST
 */

export interface User {
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
	static con: DataConnection;
	private static loaded = false;
	static successfulConnections: Map<string, DataConnection>;
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
		const myUuid = localStorage.getItem('FriendPool.uuid') || nanoid();
		const username = localStorage.getItem('FriendPool.username');
		userInfo.set({
			uuid: myUuid,
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

		if (myUuid) {
			this.successfulConnections = new Map<string, DataConnection>();
			const pendingConnections = new Map<string, DataConnection>();

			const receiving = new Peer(P2PId('friend', myUuid), {});

			const connectionEstablished = (otherUUID: string, con: DataConnection) => {
				console.log("[Friend] Connection established", otherUUID);

				this.con = con;
				pendingConnections.delete(otherUUID);
				this.successfulConnections.set(otherUUID, con);

				friendList.update((old) =>
					old.map((f) => {
						if (f.uuid == otherUUID)
							return {
								...f,
								status: 'online',
							};
						else return f;
					})
				);

				con.on('data', (data) => {
					if (data.type === 'friend.askConnect') {
						console.log(otherUUID, 'asked to connect');

						const id = Math.random().toString(20);
						con.send({
							type: 'friend.okConnect',
							id,
						});
						currentConnection.set(new Connection("", myUuid < otherUUID, undefined, undefined, con))
						goto('/play');
					} else if (data.type == 'friend.okConnect') {
						currentConnection.set(new Connection("", myUuid < otherUUID, undefined, undefined, con))
						goto('/play');
					}
				});


			}

			receiving.on('connection', (con) => {
				const otherUUID = con.peer.split('-').at(-1);
				if (otherUUID) connectionEstablished(otherUUID, con);
				else console.error('Could not find id from peer');
			});

			const tryConnect = (friendUUID: string) => {
				if (pendingConnections.has(friendUUID)) {
					pendingConnections.delete(friendUUID);
				}

				console.log("[Friend] Try connecting", friendUUID);

				const con = receiving.connect(P2PId('friend', friendUUID));

				pendingConnections.set(friendUUID, con);

				con.on('open', () => {
					connectionEstablished(friendUUID, con);
				});
				con.on('error', console.error);

				setTimeout(() => {
					if (pendingConnections.has(friendUUID)) {

						console.log("[Friend] Timed out, retry", friendUUID);
						con.close();

						tryConnect(friendUUID);
					}

				}, 2000)
			};

			receiving.on('open', () => {
				for (const friend of get(friendList)) {
					if (myUuid > friend.uuid) // Not host
						tryConnect(friend.uuid);
					else
						console.log("[Friend]", "waiting for", friend.uuid);

				}
			});
		}
	}
	static connect(friend: User) {
		const con = this.successfulConnections.get(friend.uuid);
		if (!con) return console.log('NO CON');
		con.send({ type: 'friend.askConnect' });
	}

	// For adding friends
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
		con.on('social.removeFriend', () => {
			this.removeFriend();
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


	static askRemoveFriend() {
		const con = get(currentConnection);
		if (!con) return goto('/');

		this.removeFriend();
		con.send({ type: 'social.removeFriend' });
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

	static removeFriend() {
		const opponent = get(opponentInfo);
		if (!opponent) throw new Error("Remove friend, no opponent");
		opponent.friend = false;
		opponentInfo.set(opponent);
		friendList.update(old => old.filter(e => e.uuid != opponent.uuid))
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
