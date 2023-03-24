import type { N } from "$lib/types/utils";
import type { Engine } from "matter-js";
import type { Application } from "pixi.js";
import { derived, writable } from "svelte/store";


export const factor = writable(1);
export const app = writable<N<Application>>(null);
export const appSz = derived([app], (v) => v[0] ? v[0].view.width / window.devicePixelRatio : 0)
export const engine = writable<N<Engine>>(null);