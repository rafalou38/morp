export function check<T>(v: T, name?: string): asserts v is Exclude<T, null | undefined> {
	if (v === null || v === undefined) {
		throw new Error(`Null value encountered: ${name || 'Unknown'}`);
	}
}
