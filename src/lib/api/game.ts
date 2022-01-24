import { randomCode } from '$lib/utils/gameCode';
import { P2PId } from '.';
import { Peer } from './peerjs';
import type PeerCls from 'peerjs';
import { writable } from 'svelte/store';

export const currentGame = writable<Game | null>(null);
export class Game {
	selfHosted: boolean;
	peer: PeerCls;
	code: string;
	connection: PeerCls.DataConnection | null = null;
	cb: (conn: PeerCls.DataConnection) => void;

	static async isValid(code: string): Promise<boolean> {
		// const isValid = await tempCon.disconnect();
		return true;
	}
	constructor(code: string, host: boolean, connectionCB?: (conn: PeerCls.DataConnection) => void) {
		if (!Peer) throw new Error('PeerJs not loaded');

		this.selfHosted = host;
		this.code = code;
		this.cb = connectionCB;

		if (this.selfHosted) {
			const peerID = P2PId('game', this.code);
			console.log(peerID);
			this.peer = new Peer(peerID);

			this.peer.on('open', () => {
				console.log(`[Game] Hosting game ${code}`);
				console.log(`[P2P] Peer ID: ${this.peer.id}`);
				this.connect();
			});
		} else {
			const userId = Math.random().toString(36).substring(2, 15);
			const peerID = P2PId('user', userId + 'user');
			console.log(peerID);

			this.peer = new Peer(peerID);
			this.peer.on('open', () => {
				console.log('[P2P] Connected to server', this.peer.id);
				console.log(`[P2P] Peer ID: ${this.peer.id}`);
				this.connect();
			});
		}

		this.peer.on('connection', this.handleConnection.bind(this));
		this.peer.on('disconnected', this.handleDisconnect.bind(this));
	}

	connect(): void {
		if (this.selfHosted) {
			console.log('[P2P] Waiting for peer...');
			return;
		}

		console.log('[P2P] Connecting to peer...');
		const conn = this.peer.connect(P2PId('game', this.code));
		this.handleConnection(conn);
	}

	handleConnection(conn: PeerCls.DataConnection): void {
		this.cb(conn);
		console.log('[P2P] Connection established with', conn.peer);
		this.connection = conn;
	}
	handleDisconnect(): void {
		console.log('[P2P] Disconnected from peer');
	}
	handleData(data: p2pPayload): void {
		console.log('[P2P] Received data', data);
	}
	send(data: p2pPayload): void {
		if (!this.connection) throw new Error('No connection');
		this.connection.send(data);
	}
}
