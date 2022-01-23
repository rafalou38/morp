import { browser } from '$app/env';
import type PeerJs from 'peerjs';

export let Peer: typeof PeerJs | null = null;
export let PeerLoaded: Promise<void | typeof Peer> | null = null;

if (browser) {
	PeerLoaded = import('peerjs').then((PeerJs) => {
		Peer = PeerJs.default;
	});
}
