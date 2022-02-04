import { writable as base_wt } from 'svelte/store';
import type { Writable, StartStopNotifier, Subscriber, Updater } from 'svelte/store';

export type WritableC<T> = Writable<T> & { get: () => T };

export function writableC<T>(value?: T, start?: StartStopNotifier<T>): WritableC<T> {
	const inner = base_wt(value, start);
	const cache = {
		value
	};
	const set = (n_value: T) => {
		inner.set(n_value);
		cache.value = n_value;
	};
	return {
		set,
		subscribe: inner.subscribe,
		update: (updater: Updater<T>) => {
			const n_val = updater(cache.value);
			set(n_val);
		},
		get: () => cache.value
	};
}
