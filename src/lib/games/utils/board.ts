export function checkSequences(
	board: string[],
	w = 3
):
	| {
			winner: string;
			winSequence: number[];
	  }
	| undefined {
	const sequences = [
		[0, 1 + w * 1, 2 + w * 2], // diag1
		[0 + w * 2, 1 + w * 1, 2], // diag2
		[0, 1, 2], // row1
		[0 + w * 1, 1 + w * 1, 2 + w * 1], // row2
		[0 + w * 2, 1 + w * 2, 2 + w * 2], // row3
		[0, 0 + w * 1, 0 + w * 2], // col1
		[1, 1 + w * 1, 1 + w * 2], // col2
		[2, 2 + w * 1, 2 + w * 2] // col3
	];
	for (const seq of sequences) {
		const [a, b, c] = seq;
		if (board[a] && board[b] && board[c] && board[a] === board[b] && board[a] === board[c]) {
			return {
				winner: board[a],
				winSequence: seq
			};
		}
	}
}
