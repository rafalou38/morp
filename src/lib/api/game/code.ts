import { gun } from '..';

export function isWaiting(code: string) {
	gun
		.get('games')
		.get(code)
		.get('status')
		.once((s) => console.log({ e: s }));
	// .once((status: GameStatus) => status === 'waiting');
}
export function isInUse(code: string) {
	gun
		.get('games')
		.get(code)
		.once((g) => console.log({ e: g }));
	// .once((game: any) => !!game);
}
