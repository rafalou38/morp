import './peerjs';
export const P2P_SERVER = 'MorP2PGaMe_SERVER_bc87i3a8mc';

export function P2PId(...segments: string[]): string {
	return `${P2P_SERVER}/${segments.join('/')}`;
}
