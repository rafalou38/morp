export function randomCode(size = 4): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let code = '';
	for (let i = 0; i < size; i++) {
		code += chars[Math.floor(Math.random() * chars.length)];
	}
	return code;
}
