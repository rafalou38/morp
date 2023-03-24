import { shuffle } from "$lib/utils/math";
import { Bodies, Body, Composite, Engine } from "matter-js";
import { Graphics, Rectangle, type Container } from "pixi.js";
import { get } from "svelte/store";
import { app, engine, factor } from "./Stores";
import { check } from "$lib/utils/assert";


export type MazeGrid = {
    t: boolean;
    r: boolean;
    l: boolean;
    b: boolean;
    v: boolean;
}[][]
export class Maze {
    grid: MazeGrid = [];
    width: number;
    height: number;
    gr: Graphics;

    constructor(w: number, h: number, holes: number, grid?: MazeGrid) {
        this.width = w;
        this.height = h;

        if (grid) {
            this.grid = grid;
        } else {
            this.genMaze(holes);
        }
    }


    setupScene() {
        const grStage = get(app)?.stage;
        const world = get(engine)?.world;
        check(grStage);
        check(world);

        const cw = 100 / this.width;
        const ch = 100 / this.height;
        if (!this.gr) {
            this.gr = new Graphics();
            grStage.addChild(this.gr);
        } else {
            this.gr.clear();
        }
        this.gr.beginFill(0xffffff);
        const addRect = (
            x: number,
            y: number,
            w: number,
            h: number,
        ) => {
            const rect = Bodies.rectangle(x + w / 2, y + h / 2, w, h, {
                isStatic: true,
                restitution: 1,
                friction: 0,
            });
            Composite.add(world, rect);
            console.log(get(factor));

            this.gr.drawRect(
                x * get(factor),
                y * get(factor),
                w * get(factor),
                h * get(factor)
            )
        }
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const cell = this.grid[x][y];
                const width = this.width / 7;


                if (x == 0)
                    addRect(cw * x, ch * y, width, ch);
                if (y == 0)
                    addRect(cw * x, ch * y, cw, width);

                if (cell.b)
                    addRect(cw * x, ch * y + ch - width, cw, width);
                if (cell.r)
                    addRect(cw * x + cw - width, ch * y - width, width, ch + width);
            }
        }
        this.gr.endFill();

        return cw;
    }

    genMaze(holes: number) {
        // FIll in array
        for (let x = 0; x < this.width; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.height; y++) {
                this.grid[x][y] = {
                    v: false,
                    t: true,
                    r: true,
                    l: true,
                    b: true,
                };
            }
        }

        // Generate
        const LEFT = [-1, 0];
        const TOP = [0, -1];
        const RIGHT = [1, 0];
        const BOTTOM = [0, 1];
        const tests = [LEFT, TOP, RIGHT, BOTTOM];
        const history: number[][] = [];
        let x = 0,
            y = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            step: {
                this.grid[x][y].v = true;
                for (const option of shuffle(tests)) {
                    const nx = x + option[0];
                    const ny = y + option[1];
                    const targetCell = this.grid[nx]?.[ny];
                    if (targetCell?.v == false) {
                        switch (option + '') {
                            case TOP + '':
                                this.grid[x][y].t = false;
                                targetCell.b = false;
                                break;
                            case RIGHT + '':
                                this.grid[x][y].r = false;
                                targetCell.l = false;
                                break;
                            case BOTTOM + '':
                                this.grid[x][y].b = false;
                                targetCell.t = false;
                                break;
                            case LEFT + '':
                                this.grid[x][y].l = false;
                                targetCell.r = false;
                                break;

                            default:
                                throw new Error('Nope');
                        }
                        history.push([x, y]);
                        // console.log(x, y);

                        x = nx;
                        y = ny;

                        // targetCell.v = true;

                        break step;
                    }
                }

                // No neighbour found
                if (history.length == 0) {
                    break;
                }
                [x, y] = history.pop()!;
            }
        }

        // Add holes in the maze
        let tries = 0;
        while (holes > 0 && tries < this.width * this.height) {
            tries++;
            console.log("try");

            process: {
                const x = Math.floor(Math.random() * this.width);
                const y = Math.floor(Math.random() * this.height);
                // debugger;

                for (const option of shuffle(tests)) {
                    const nx = x + option[0];
                    const ny = y + option[1];
                    const targetCell = this.grid[nx]?.[ny];
                    if (!targetCell) continue;

                    switch (option + '') {
                        case TOP + '':
                            if (!targetCell.b) break process;
                            this.grid[x][y].t = false;
                            targetCell.b = false;
                            break;
                        case RIGHT + '':
                            if (!targetCell.l) break process;
                            this.grid[x][y].r = false;
                            targetCell.l = false;
                            break;
                        case BOTTOM + '':
                            if (!targetCell.t) break process;
                            this.grid[x][y].b = false;
                            targetCell.t = false;
                            break;
                        case LEFT + '':
                            if (!targetCell.r) break process;
                            this.grid[x][y].l = false;
                            targetCell.r = false;
                            break;

                        default:
                            throw new Error('Nope');
                    }

                    break;
                }

                holes--;
            }
            tries = 0;

        }
    }
}