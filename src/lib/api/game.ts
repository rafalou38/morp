import { randomCode } from '$lib/utils/gameCode';
import { P2PId } from '.';
import { Peer } from './peerjs';
import type PeerCls from 'peerjs';

export class Game {
	selfHosted: boolean;
	peer: PeerCls;
	code: string;
	connection: PeerCls.DataConnection | null = null;

	static async isValid(code: string): Promise<boolean> {
		// const isValid = await tempCon.disconnect();
		return true;
	}
	constructor(code: string | null) {
		if (!Peer) throw new Error('PeerJs not loaded');

		this.selfHosted = code == null;
		this.code = code || randomCode();

		this.peer = new Peer();
		this.peer.on('open', () => {
			if (this.selfHosted) {
				this.peer.id = P2PId('game', this.code);
				console.log(`[Game] Hosting game ${code}`);
				console.log(`[P2P] Peer ID: ${this.peer.id}`);
			} else {
				const userId = Math.random().toString(36).substring(2, 15);
				this.peer.id = P2PId('user', userId);
				console.log('[P2P] Connected to server', this.peer.id);
				console.log(`[P2P] Peer ID: ${this.peer.id}`);
			}
		});

		this.peer.on('connection', this.handleConnection.bind(this));
		this.peer.on('disconnected', this.handleDisconnect.bind(this));

		this.connect();
	}

	connect(): void {
		if (this.selfHosted) {
			console.log('[P2P] Waiting for peer...');
			return;
		}

		console.log('[P2P] Connecting to peer...');
		this.peer.connect(this.code);
	}

	handleConnection(conn: PeerCls.DataConnection): void {
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
