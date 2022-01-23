import { randomCode } from '$lib/utils/gameCode';
import { gun } from '..';

export async function createGame(): Promise<string> {
	const code = await randomCode();

	const game = gun.get('games').get(code);
	game.put({
		code,
		players: {},
		status: 'waiting'
	});

	return code;
}
