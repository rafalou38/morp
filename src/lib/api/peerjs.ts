import { browser } from '$app/env';
import type PeerJs from 'peerjs';

export let Peer: typeof PeerJs | null = null;
export let PeerLoaded: Promise<void | typeof Peer> | null = null;

if (browser && !Peer) {
	PeerLoaded = import('peerjs').then((PeerJs) => {
		console.log('Imported peerjs');

		Peer = PeerJs.default;
	});
}
