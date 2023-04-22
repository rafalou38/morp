import type { GameInfo } from "$lib/games/GameList";
import { writable } from "svelte/store";

export type Message = {
    from: 'You' | 'Opponent';
    type: 'message';
    text: string;
};
export type GameProposition = {
    from: 'You' | 'Opponent';
    type: 'game';
    game: GameInfo;
};
export const log = writable<(Message | GameProposition)[]>([]);
export const chatOpen = writable(false);