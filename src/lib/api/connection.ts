import { randomCode } from '$lib/utils/gameCode';
import { P2PId } from '.';
import { Peer } from './peerjs';
import type PeerCls from 'peerjs';
import { writable } from 'svelte/store';
import { FriendPool } from './FriendsPool';

export const currentConnection = writable<Connection | null>(null);

export class Connection {
	peer: PeerCls;
	code: string;
	connection: PeerCls.DataConnection | null = null;
	connected: boolean;
	private selfHosted: boolean;
	private connectTimeout: NodeJS.Timeout | null = null;
	private initInterval: NodeJS.Timeout | null = null;
	private cb: (conn: PeerCls.DataConnection) => void;
	private errCb: () => void;
	private listeners: Map<string, (data: p2pPayload) => void> = new Map();

	static async isValid(code: string): Promise<boolean> {
		// const isValid = await tempCon.disconnect();
		return true;
	}
	constructor(
		code: string,
		host: boolean,
		connectionCB?: (conn: PeerCls.DataConnection) => void,
		errCD?: () => void,
		con?: PeerCls.DataConnection
	) {
		if (!Peer) throw new Error('PeerJs not loaded');

		this.selfHosted = host;
		if (con) {
			this.connection = con;
			this.connection.on('data', this.handleData.bind(this));
			this.success()
			return;
		}
		this.code = code;
		if (connectionCB) this.cb = connectionCB;
		if (errCD) this.errCb = errCD;

		if (this.selfHosted) {
			const peerID = P2PId('game', this.code);
			console.log(peerID);
			this.peer = new Peer(peerID);

			this.peer.on('open', () => {
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

	private connect(): void {
		if (this.selfHosted) {
			console.log('[P2P] Waiting for peer...');
			return;
		}

		console.log('[P2P] Connecting to peer...');

		const conn = this.peer.connect(P2PId('game', this.code), {
			serialization: 'json',
		});
		conn.on('open', console.log);

		this.handleConnection(conn);
	}

	private handleConnection(conn: PeerCls.DataConnection): void {
		this.connection = conn;

		console.log('[P2P] Checking connection');
		this.connectTimeout = setTimeout(() => {
			if (this.initInterval) clearInterval(this.initInterval);
			this.connectTimeout = null;
			console.log('[P2P] Connection timed out');
			this.peer.disconnect();
			this.errCb();
		}, 5000);

		conn.on('data', this.handleData.bind(this));

		this.initInterval = setInterval(() => {
			console.log('[P2P] Sending initialization');
			conn.send({ type: 'initialization' });
		}, 1000);
	}

	private handleDisconnect(): void {
		console.log('[P2P] Disconnected from peer');
	}
	private handleData(data: p2pPayload): void {
		if (!this.connection) throw new Error('Received data without connection ?!');

		if (data.type === 'initialization') {
			if (this.connected) return;

			console.log('[P2P] Sending initialization');
			this.connection.send({ type: 'initialization' });

			if (this.connectTimeout) clearTimeout(this.connectTimeout);
			if (this.initInterval) clearInterval(this.initInterval);

			console.log('[P2P] Connection established with', this.connection.peer);
			this.success();
			return;
		}

		const listener = this.listeners.get(data.type);

		if (listener) {
			listener(data);
		} else {
			// TODO: Queue event
			console.log('[P2P] No listener for', data.type);
		}
	}
	private success() {
		if (!this.connection) throw new Error('Success data without connection ?!');

		FriendPool.setupListeners(this);

		this.connected = true;
		this.cb?.(this.connection);
	}
	on(event: string, cb: (data: p2pPayload) => void): void {
		this.listeners.set(event, cb);
	}
	clear(obsolete: string): void {
		this.listeners = new Map(
			[...this.listeners.entries()].filter(([key, cb]) => !key.includes(obsolete))
		);
	}
	send(data: p2pPayload): void {
		if (!this.connection) throw new Error('No connection');
		this.connection.send(data);
	}

	public get isHost(): boolean {
		return this.selfHosted;
	}
}
