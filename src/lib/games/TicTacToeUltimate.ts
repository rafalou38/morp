import type { Connection } from '$lib/api/connection';
import type { WritableC } from '$lib/utils/writable';
import { writableC } from '$lib/utils/writable';
import { checkSequences } from './utils/board';

export class TicTacToeUltimate {
	conn: Connection;

	private winner: WritableC<{
		character: string;
		winSequence: number[];
	} | null> = writableC(null);
	private grid: WritableC<((null | string)[] | string)[]> = writableC(null);
	private curentSubGridIndex = writableC(0);
	private meNext = writableC(false);

	private whoStarted: 'ME' | 'OPPONENT' | null = null;
	private myChar: string;
	private opponentChar: string;

	constructor(conn: Connection, myChar: string, opponentChar: string) {
		this.conn = conn;
		this.grid.set(new Array(3 * 3).fill(null).map(() => new Array(3 * 3).fill(null)));
		this.myChar = myChar;
		this.opponentChar = opponentChar;
		this.setupListeners();
	}
	private setupListeners() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		this.conn.on('whoFirst', ({ data: who }) => {
			console.log("who's first:", who, this, self);

			if (who === 'YOU') this.meNext.set(true);
			else this.meNext.set(false);

			this.whoStarted = this.meNext ? 'ME' : 'OPPONENT';
		});
		this.conn.on('takeTTTu', ({ data: { n } }) => {
			if (this.meNext.get()) alert('There was a sync error, please restart the game');
			else {
				this._take(n, this.opponentChar);
			}
		});
		this.conn.on('curentSubGridIndex', ({ data: n }) => {
			this.curentSubGridIndex.set(n);
		});
		this.conn.on('reset', () => {
			this.reset(true);
		});
	}
	getStores() {
		return {
			winner: this.winner,
			grid: this.grid,
			curentSubGridIndex: this.curentSubGridIndex,
			meNext: this.meNext
		};
	}
	start() {
		if (this.whoStarted !== null) {
			this.whoStarted = this.whoStarted === 'ME' ? 'ME' : 'OPPONENT';
		} else if (this.conn.isHost) {
			// Host chooses who starts
			// const hostStarts = Math.round(Math.random());
			const hostStarts = 0;
			if (hostStarts) {
				this.conn.send({
					type: 'whoFirst',
					data: 'ME'
				});
				this.whoStarted = 'ME';
				this.meNext.set(true);
			} else {
				this.conn.send({
					type: 'whoFirst',
					data: 'YOU'
				});
				this.whoStarted = 'OPPONENT';
				this.meNext.set(false);
			}
		}
	}
	private _take(n: number, char: string) {
		this.grid.update((old_grid) => {
			const subGrid = old_grid[this.curentSubGridIndex.get()];
			if (typeof subGrid === 'string') {
				alert('There was a sync error, please restart the game');
				throw new Error('Sync error');
			}
			subGrid[n] = char;
			this.meNext.update((v) => !v);
			this.updateBoard();
			return old_grid;
		});
	}
	getNextSubGridIndex(n: number): number {
		const grid = this.grid.get();
		if (typeof grid[n] == 'string') {
			const openGrids = grid.map((c, i) => i).filter((i) => typeof grid[i] !== 'string');
			if (openGrids.length === 0) return -1;
			const choice = openGrids[Math.floor(Math.random() * openGrids.length)];
			return choice;
		} else {
			return n;
		}
	}
	take(n: number): void {
		if (
			!this.meNext.get() ||
			this.winner.get() ||
			typeof this.grid.get()[this.curentSubGridIndex.get()][n] === 'string'
		)
			return;

		this._take(n, this.myChar);

		this.conn.send({
			type: 'takeTTTu',
			data: {
				n
			}
		});
		this.curentSubGridIndex.set(this.getNextSubGridIndex(n));
		this.conn.send({
			type: 'curentSubGridIndex',
			data: this.curentSubGridIndex.get()
		});
	}
	updateBoard(): void {
		// for (const subGrid of this.grid) {
		const grid = this.grid.get();
		for (let i = 0; i < grid.length; i++) {
			const subGrid = grid[i];
			if (typeof subGrid === 'string') continue;

			const analysis = checkSequences(subGrid);
			if (analysis?.winner) grid[i] = analysis.winner;
		}

		const globalAnalysis = checkSequences(grid as string[]);
		if (globalAnalysis?.winner)
			this.winner.set({
				character: globalAnalysis.winner,
				winSequence: globalAnalysis.winSequence
			});
	}
	reset(remote = false): void {
		if (!remote)
			this.conn.send({
				type: 'reset'
			});
		this.grid.set(new Array(3 * 3).fill(null).map(() => new Array(3 * 3).fill(null)));
		this.winner.set(null);
		this.curentSubGridIndex.set(0);
		this.meNext.set(this.whoStarted === 'ME' ? false : true);
	}
}
