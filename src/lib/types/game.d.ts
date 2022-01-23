// {
// 		code,
// 		players: {},
// 		status: 'waiting'
// 	}

declare type GameStatus = 'waiting' | 'playing' | 'finished';

declare interface Game {
	code: string;
	players: unknown;
	gameState: string;
	status: GameStatus;
}
