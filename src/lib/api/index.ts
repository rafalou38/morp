import './peerjs';
export const P2P_SERVER = 'MorP2PGaMe_SERVER_bc87i3a8mc';

export function P2PId(...segments: string[]): string {
	segments.unshift(P2P_SERVER);
	return segments.join('-');
}
