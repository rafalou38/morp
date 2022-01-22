export function randomCode(): string {
	let code = '';
	for (let i = 0; i < 9; i++) {
		code += Math.round(Math.random());
	}
	return code;
}
