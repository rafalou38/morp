export type Owner = 'self' | 'other' | 'clear';
export const RED = 0xe74c3c;
export const GREEN = 0x2ecc71;
export const GRAY = 0xbdc3c7;
export const WHITE = 0xffffff;
export const ownerMap = new Map<Owner, Owner>([
	['clear', 'clear'],
	['other', 'self'],
	['self', 'other'],
]);
