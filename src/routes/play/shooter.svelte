<script lang="ts">
	import p5js from 'p5';
	import { onMount, onDestroy } from 'svelte';
	import { currentConnection } from '$lib/api/connection';
	import { goto } from '$app/navigation';

	import { Waiter } from '$lib/utils/time';
	import { Circle, FillStyle, Rectangle } from 'pixi.js';
	import { text } from 'svelte/internal';

	const sendDelay = Waiter(50);

	const main = (p5: p5js) => {
		if (!$currentConnection) return goto('/');

		let point = [0, 0];
		let refill = 0;
		let screenpos = [1, 0];
		let playerpos = [150, 0, 30, 45, 0, 1];
		let enemypos = [150, 0, 30, 45, 0];
		let vector = [0, 0];
		let gravity = 25;

		let collision = new Array(194);
		for (let i = 0; i < 194; i++) {
			collision[i] = new Array(2);
		}
		//   0;pv    1;  bullets   2;smoke 3;trap
		let playerdata = [100, 50, 2, 1];
		//   0-10 pl.bullets   10-20 en.bullets  20-22 pl.smoke  22-24 en.smoke    26-30 pl.trap   24pl.grab  25  en.grab
		let weapon = new Array(30);
		for (let i = 0; i < 30; i++) {
			weapon[i] = new Array(3);
		}
		//---------z------q------s------d------?used
		let kpr = [false, false, false, false, true, false, false, false];

		let start = false;
		let boom = 0;

		p5.setup = () => {
			let canvas = p5.createCanvas(750, 750);
			screenpos[1] = 1000 - p5.width;
			playerpos[1] = p5.height - 200 + screenpos[1];

			for (let i = 0; i < 5; i++) {
				collision[i][0] = i + 1;
				collision[i][1] = 0;
			}
			for (let i = 5; i < 10; i++) {
				collision[i][0] = 0 + 1;
				collision[i][1] = i - 4;
			}
			for (let i = 10; i < 18; i++) {
				collision[i][0] = 1 + 1;
				collision[i][1] = i - 5;
			}
			collision[18][0] = 0 + 1;
			collision[18][1] = 12;
			for (let i = 19; i < 25; i++) {
				collision[i][0] = 0;
				collision[i][1] = i - 7;
			}
			for (let i = 25; i < 27; i++) {
				collision[i][0] = 4 + 1;
				collision[i][1] = i - 24;
			}
			for (let i = 27; i < 37; i++) {
				collision[i][0] = 3 + 1;
				collision[i][1] = i - 22;
			}
			for (let i = 37; i < 44; i++) {
				collision[i][0] = i - 32 + 1;
				collision[i][1] = 2;
			}
			for (let i = 44; i < 47; i++) {
				collision[i][0] = i - 38 + 1;
				collision[i][1] = 5;
			}
			for (let i = 47; i < 50; i++) {
				collision[i][0] = i - 41 + 1;
				collision[i][1] = 8;
			}
			for (let i = 50; i < 52; i++) {
				collision[i][0] = 11 + 1;
				collision[i][1] = 54 - i;
			}
			for (let i = 52; i < 54; i++) {
				collision[i][0] = 8 + 1;
				collision[i][1] = 59 - i;
			}
			for (let i = 54; i < 56; i++) {
				collision[i][0] = 14 + 1;
				collision[i][1] = 58 - i;
			}
			for (let i = 56; i < 58; i++) {
				collision[i][0] = 69 - i + 1;
				collision[i][1] = 4;
			}
			for (let i = 58; i < 60; i++) {
				collision[i][0] = 73 - i + 1;
				collision[i][1] = 2;
			}
			for (let i = 60; i < 62; i++) {
				collision[i][0] = 73 - i + 1;
				collision[i][1] = 8;
			}
			for (let i = 62; i < 67; i++) {
				collision[i][0] = 11 + 1;
				collision[i][1] = 73 - i;
			}
			for (let i = 67; i < 71; i++) {
				collision[i][0] = 77 - i + 1;
				collision[i][1] = 11;
			}
			for (let i = 71; i < 77; i++) {
				collision[i][0] = 80 - i + 1;
				collision[i][1] = 14;
			}
			for (let i = 77; i < 93; i++) {
				collision[i][0] = 92 - i + 1;
				collision[i][1] = 17;
			}
			for (let i = 93; i < 95; i++) {
				collision[i][0] = 108 - i + 1;
				collision[i][1] = 11;
			}
			for (let i = 95; i < 97; i++) {
				collision[i][0] = 14 + 1;
				collision[i][1] = 108 - i;
			}
			//15   3

			for (let i = 0; i < 97; i++) {
				collision[97 + i][0] = 33 - collision[i][0];
				collision[97 + i][1] = collision[i][1];
			}

			$currentConnection?.send({
				type: 'shooter.start',
			});

			playerpos[1] = 800;
			if ($currentConnection?.isHost) {
				playerpos[0] = 400;
			} else {
				playerpos[0] = 1300;
			}
		};

		p5.draw = () => {
			if (Date.now() - refill >= 30_000 * 1.5) {
				refill = Date.now();
				playerdata[1] = 50;
				playerdata[2] += 1;
				playerdata[3] += 1;
			}
			p5.background(10, 10, 10);

			if (!start) return;
			if (sendDelay()) {
				$currentConnection?.send({
					type: 'shooter.pos',
					pos: playerpos,
				});
			}
			p5.fill(255);

			if (kpr[1]) {
				vector[0] -= 6;
				//screenpos[0] -=5;
			}
			if (kpr[3]) {
				//screenpos[0] +=5;
				vector[0] += 6;
			}
			if (!kpr[0]) {
				gravity = 175;
			}
			vector[0] *= 0.9;
			vector[1] = vector[1] * (1 - gravity / 1000) + gravity;
			// line(playerpos[0]-screenpos[0]*50,playerpos[1]-screenpos[1]-playerpos[3]/2,playerpos[0]-screenpos[0]*50+vector[0],playerpos[1]-screenpos[1]-playerpos[3]/2+vector[1]/10-10);

			for (let i = 0; i < 194; i += 1) {
				if (
					playerpos[1] - 10 > -collision[i][1] * 50 + 1000 &&
					playerpos[1] - playerpos[3] + 20 < (-collision[i][1] + 1) * 50 + 1000 &&
					playerpos[0] + playerpos[2] / 2 + 5 > collision[i][0] * 50 &&
					playerpos[0] - playerpos[2] / 2 - 5 < (collision[i][0] + 1) * 50 &&
					kpr[7]
				) {
					vector[0] = 0;
				}
				if (
					playerpos[1] > -collision[i][1] * 50 + 1000 &&
					playerpos[1] - 12.5 < (-collision[i][1] + 1) * 50 + 1000 &&
					playerpos[0] + (playerpos[2] / 5) * 2 + 5 > collision[i][0] * 50 &&
					playerpos[0] - (playerpos[2] / 5) * 2 + 5 < (collision[i][0] + 1) * 50
				) {
					p5.fill(255, 255, 0);

					vector[1] = 75;
					playerpos[1] -= playerpos[1] - (-collision[i][1] * 50 + 1000);
					if (kpr[0]) {
						vector[1] = -1750;
						gravity = 35;
					}
				} else if (
					playerpos[1] - playerpos[3] > -collision[i][1] * 50 + 1000 &&
					playerpos[1] - playerpos[3] < (-collision[i][1] + 1) * 50 + 1000 &&
					playerpos[0] + playerpos[2] / 3 > collision[i][0] * 50 &&
					playerpos[0] - playerpos[2] / 3 < (collision[i][0] + 1) * 50
				) {
					p5.fill(255, 0, 255);
					if (kpr[6]) {
						playerpos[1] += 0.2;
						vector[1] = 0;
					} else {
						playerpos[1] += 5;
						vector[1] = 25;
					}
				} else {
					p5.fill(255);
				}
				if (
					playerpos[1] - 10 > -collision[i][1] * 50 + 1000 &&
					playerpos[1] - playerpos[3] + 20 < (-collision[i][1] + 1) * 50 + 1000 &&
					playerpos[0] - 5 - playerpos[2] / 2 < (collision[i][0] + 1) * 50 &&
					playerpos[0] - 5 + playerpos[2] / 2 > collision[i][0] * 50
				) {
					p5.fill(0, 255, 0);
					vector[0] = 0;
					playerpos[0] += 0.3;
					if (weapon[24][2] != 0) {
						weapon[24][2] = 0;
						$currentConnection?.send({
							type: 'shooter.ngrab',
						});
					}
				} else if (
					playerpos[1] - 10 > -collision[i][1] * 50 + 1000 &&
					playerpos[1] - playerpos[3] + 20 < (-collision[i][1] + 1) * 50 + 1000 &&
					playerpos[0] + 5 + playerpos[2] / 2 > collision[i][0] * 50 &&
					playerpos[0] - 5 + playerpos[2] / 2 < collision[i][0] * 50
				) {
					p5.fill(0, 255, 0);
					vector[0] = 0;
					playerpos[0] -= 0.3;
					if (weapon[24][2] != 0) {
						weapon[24][2] = 0;
						$currentConnection?.send({
							type: 'shooter.ngrab',
						});
					}
				}
				if (
					kpr[4] &&
					collision[i][0] * 50 - screenpos[0] * 50 < p5.width + 50 &&
					collision[i][0] * 50 - screenpos[0] * 50 > -50 &&
					-collision[i][1] * 50 - screenpos[1] + 1000 < p5.height + 50 &&
					-collision[i][1] * 50 - screenpos[1] + 1000 > -50
				) {
					p5.noFill();
					p5.stroke(255, 255, 100);
					p5.rect(
						collision[i][0] * 50 - screenpos[0] * 50,
						-collision[i][1] * 50 - screenpos[1] + 1000,
						50,
						50
					);
					p5.fill(0);
					//p5.text(
					//	collision[i][0] + ',' + collision[i][1],
					//	collision[i][0] * 50 + 5 - screenpos[0] * 50,
					//	-collision[i][1] * 50 + 15 - screenpos[1] + 1000
					//);
				} else if (
					collision[i][0] * 50 - screenpos[0] * 50 < p5.width &&
					collision[i][0] * 50 - screenpos[0] * 50 > -50 &&
					-collision[i][1] * 50 - screenpos[1] + 1000 < p5.width &&
					-collision[i][1] * 50 - screenpos[1] + 1000 > -50
				) {
					//  image(texture,collision[i] [0]*50-screenpos[0]*50, -collision[i] [1]*50-screenpos[1]+1000, 50, 50);
				}
				for (let ii = 0; ii < 20; ii++) {
					if (weapon[ii][2] != 0) {
						if (
							weapon[ii][0] > collision[i][0] * 50 &&
							weapon[ii][1] > -collision[i][1] * 50 + 1000 &&
							weapon[ii][0] < collision[i][0] * 50 + 50 &&
							weapon[ii][1] < -collision[i][1] * 50 + 1000 + 50
						) {
							weapon[ii][2] = 0;
						}
					}
				}
				for (let ii = 20; ii < 24; ii++) {
					if (weapon[ii][2] == -1 || weapon[ii][2] == 1) {
						if (
							weapon[ii][0] > collision[i][0] * 50 &&
							weapon[ii][1] > -collision[i][1] * 50 + 1000 &&
							weapon[ii][0] < collision[i][0] * 50 + 50 &&
							weapon[ii][1] < -collision[i][1] * 50 + 1000 + 50
						) {
							weapon[ii][2] = Date.now() + 2;
						}
					}
				}
				for (let ii = 24; ii < 26; ii++) {
					if (weapon[ii][2] == -1 || weapon[ii][2] == 1) {
						if (
							weapon[ii][0] > collision[i][0] * 50 &&
							weapon[ii][1] > -collision[i][1] * 50 + 1000 &&
							weapon[ii][0] < collision[i][0] * 50 + 50 &&
							weapon[ii][1] < -collision[i][1] * 50 + 1000 + 50
						) {
							weapon[ii][2] *= 2;
						}
					}
				}
			}
			p5.stroke(50, 20, 100);
			p5.fill(150, 50, 200);
			for (let i = 26; i < 30; i++) {
				if (weapon[i][2] == 1) {
					p5.rect(weapon[i][0] - screenpos[0] * 50 - 15, weapon[i][1] - screenpos[1], 30, 15);

					if (
						enemypos[0] > weapon[i][0] - 25 &&
						enemypos[0] < weapon[i][0] + 25 &&
						enemypos[1] > weapon[i][1] - 40 &&
						enemypos[1] < weapon[i][1] + 25
					) {
						$currentConnection?.send({
							type: 'shooter.boom',
						});
						weapon[i][2] = 0;
					}
				}
			}
			p5.strokeWeight(3);
			for (let i = 24; i < 26; i++) {
				if (weapon[i][2] != 0) {
					if (weapon[i][2] == -1 || weapon[i][2] == 1) {
						weapon[i][0] += 45 * weapon[i][2];
					} else if (weapon[i][2] == -2 || weapon[i][2] == 2) {
						if (i == 24) {
							vector[0] = 0;
							vector[1] = 0;
							playerpos[0] += (weapon[i][2] * p5.abs(weapon[i][0] - playerpos[0])) / 30 + 1;
						} else if (i == 25) {
							enemypos[0] += (weapon[i][2] * p5.abs(weapon[i][0] - enemypos[0])) / 30 + 1;
						}
					}
					if (i == 24) {
						p5.stroke(50, 200, 50);
						p5.circle(weapon[i][0] - screenpos[0] * 50, weapon[i][1] - screenpos[1], 10);
						p5.line(
							weapon[i][0] - screenpos[0] * 50,
							weapon[i][1] - screenpos[1],
							playerpos[0] - screenpos[0] * 50,
							playerpos[1] - playerpos[3] / 2 - screenpos[1]
						);
						if (
							weapon[i][0] > enemypos[0] - enemypos[2] / 2 &&
							weapon[i][1] > enemypos[1] - enemypos[3] &&
							weapon[i][0] < enemypos[0] + enemypos[2] / 2 &&
							weapon[i][1] < enemypos[1]
						) {
							$currentConnection?.send({
								type: 'shooter.hit',
								d: weapon[i][2],
							});
							$currentConnection?.send({
								type: 'shooter.ngrab',
							});
							weapon[i][2] = 0;
						}
					} else if (i == 25) {
						p5.stroke(150, 50, 200);
						p5.circle(weapon[i][0] - screenpos[0] * 50, weapon[i][1] - screenpos[1], 10);
						p5.line(
							weapon[i][0] - screenpos[0] * 50,
							weapon[i][1] - screenpos[1],
							enemypos[0] - screenpos[0] * 50,
							enemypos[1] - enemypos[3] / 2 - screenpos[1]
						);
					}
				}
			}

			for (let i = 0; i < 20; i++) {
				if (weapon[i][2] != 0) {
					if (i < 10) {
						p5.stroke(100, 100, 255);
						if (
							weapon[i][0] > enemypos[0] - enemypos[2] / 2 &&
							weapon[i][1] > enemypos[1] - enemypos[3] &&
							weapon[i][0] < enemypos[0] + enemypos[2] / 2 &&
							weapon[i][1] < enemypos[1]
						) {
							$currentConnection?.send({
								type: 'shooter.hit',
								d: weapon[i][2],
							});
							weapon[i][2] = 0;
						}
					} else {
						p5.stroke(255, 100, 100);
						if (
							weapon[i][0] > playerpos[0] - playerpos[2] / 2 &&
							weapon[i][1] > playerpos[1] - playerpos[3] &&
							weapon[i][0] < playerpos[0] + playerpos[2] / 2 &&
							weapon[i][1] < playerpos[1]
						) {
							weapon[i][2] = 0;
						}
					}
					p5.line(
						weapon[i][0] - screenpos[0] * 50,
						weapon[i][1] - screenpos[1],
						weapon[i][0] - screenpos[0] * 50 + 10 * weapon[i][2],
						weapon[i][1] - screenpos[1]
					);
					weapon[i][0] += 20 * weapon[i][2];
				}
			}
			p5.strokeWeight(2);
			p5.fill(255);
			if (playerpos[0] - screenpos[0] * 50 < playerpos[2] / 2) {
				vector[0] = 0;
				playerpos[0] += 1;
			}
			playerpos[0] += vector[0] / 10;
			playerpos[1] += vector[1] / 100;

			p5.stroke(0, 0, 255);
			p5.rect(
				playerpos[0] - screenpos[0] * 50 - playerpos[2] / 2,
				playerpos[1] - screenpos[1] - playerpos[3],
				playerpos[2],
				playerpos[3]
			);
			if (
				kpr[4] &&
				enemypos[0] - screenpos[0] * 50 < p5.width + 50 &&
				enemypos[0] - screenpos[0] * 50 > -50 &&
				enemypos[1] - screenpos[1] < p5.height + 50 &&
				enemypos[1] - screenpos[1] > -50
			) {
				p5.stroke(255, 0, 0);
				p5.rect(
					enemypos[0] - screenpos[0] * 50 - enemypos[2] / 2,
					enemypos[1] - screenpos[1] - enemypos[3],
					enemypos[2],
					enemypos[3]
				);
			}

			p5.fill(100);
			p5.stroke(50);
			for (let i = 20; i < 24; i++) {
				if (weapon[i][2] == -1 || weapon[i][2] == 1) {
					weapon[i][0] += 10 * weapon[i][2];
					weapon[i][1] += 3;
					p5.square(weapon[i][0] - screenpos[0] * 50, weapon[i][1] - screenpos[1], 10);
				} else if (weapon[i][2] > 1) {
					for (let x = 0; x < 5; x++) {
						for (let y = 0; y < 5; y++) {
							p5.square(
								weapon[i][0] +
									x * 40 +
									(y % 2) * 25 -
									100 -
									screenpos[0] * 50 -
									(100 - (Date.now() - weapon[i][2]) / 400) / 2,
								weapon[i][1] +
									y * 40 +
									(x % 2) * 25 -
									100 -
									screenpos[1] -
									(100 - (Date.now() - weapon[i][2]) / 400) / 2,
								100 - (Date.now() - weapon[i][2]) / 400
							);
						}
					}
					if (100 - (Date.now() - weapon[i][2]) / 400 < 0) {
						weapon[i][2] = 0;
					}
				}
			}

			kpr[0] = false;
			kpr[1] = false;
			kpr[2] = false;
			kpr[3] = false;

			if (p5.keyIsPressed) {
				if (p5.keyIsDown(38)) {
					kpr[0] = true;
				}
				if (p5.keyIsDown(37)) {
					kpr[1] = true;
					playerpos[5] = -1;
				}
				if (p5.keyIsDown(39)) {
					kpr[3] = true;
					playerpos[5] = 1;
				}
				if (p5.keyIsDown(40)) {
					kpr[2] = true;
				}
			}

			p5.fill(50, 50, 255);
			p5.noStroke();
			if (playerdata[1] == 0) {
				p5.textSize(10);
				p5.text('Not enough ammo', 4, 25);
			} else {
				for (let i = 0; i < playerdata[1]; i++) {
					p5.rect(4 + i * 4, 25, 2, 10);
				}
			}
			p5.stroke(0, 155, 0);
			p5.fill(50, 255, 50);
			p5.rect(0, 10, playerdata[0] * 2.5, 5);
			p5.noStroke();

			p5.fill(150, 150, 150);
			for (let i = 0; i < playerdata[2]; i++) {
				p5.square(10 + playerdata[3] * 10 + i * 10, 40, 7);
			}
			p5.fill(255, 150, 150);
			for (let i = 0; i < playerdata[3]; i++) {
				p5.square(4 + i * 10, 40, 7);
			}

			p5.fill(0, 0, 255);

			if (Date.now() - lastgrab - 7000 * 1.5 <= 0) {
				p5.rect(0, 50, (7000 * 1.5 - Date.now() + lastgrab) / 70, 5);
			}
			if (playerpos[0] < -20 || playerpos[0] > 2000 || playerpos[1] < -100 || playerpos[1] > 2000) {
				playerpos[0] = 200;
				playerpos[1] = 500;
			}
			screenpos[0] = (playerpos[0] - p5.width / 2) / 50;
			screenpos[1] = playerpos[1] - p5.height / 2;
			if (boom > 0) {
				p5.fill(Date.now() - boom + 100, 50 - (Date.now() - boom), 0);
				p5.circle(
					playerpos[0] - screenpos[0] * 50,
					playerpos[1] - screenpos[1],
					(Date.now() - boom) * 5
				);
				if (75 < Date.now() - boom) {
					boom = -Date.now();
				}
			} else if (boom < 0) {
				p5.fill(255, 0, 0, 200 - (Date.now() + boom) / 25);
				p5.rect(0, 0, p5.width, p5.height);
			}
			p5.fill(200);
			p5.text(p5.int((Date.now() - refill) / 1000), 10, 70);

			if (touch > 0) {
				p5.noStroke();
				p5.fill(255, 0, 0, touch * 100);
				p5.rect(0, 0, p5.width, p5.height);
				if (p5.int(Date.now()) % 4 == 0) {
					touch -= 1;
				}
			}
			p5.textSize(25);
			p5.fill(0, 0, 255);
			p5.text(point[1], p5.width - 100, 25);
			p5.fill(255, 0, 0);
			p5.text(point[1], p5.width - 25, 25);
			p5.textSize(10);
			if (playerdata[0] < 0) {
				$currentConnection?.send({
					type: 'shooter.dead',
				});
				playerpos = [150, 0, 30, 45, 0, 1];
				playerdata = [100, 50, 2, 1];
				refill = 0;
				playerpos[1] = 800;
				if ($currentConnection?.isHost) {
					playerpos[0] = 400;
				} else {
					playerpos[0] = 1300;
				}
				point[1] += 1;
			}
		};

		let lastShoot = 0;
		let lastgrab = 0;
		let lasttrap = 0;
		let lastsmoke = 0;
		p5.keyPressed = () => {
			if (p5.keyIsDown(32) && Date.now() - lastShoot >= 100 * 1.5 && playerdata[1] > 0) {
				$currentConnection?.send({
					type: 'shooter.shoot',
					o: playerdata[1] % 10,
				});
				lastShoot = Date.now();
				weapon[playerdata[1] % 10][0] = playerpos[0];
				weapon[playerdata[1] % 10][1] = playerpos[1] - playerpos[3] / 2;
				weapon[playerdata[1] % 10][2] = playerpos[5];
				playerdata[1] -= 1;
			}
			if (p5.keyIsDown(65)) {
				if (Date.now() - lastgrab >= 7000 * 1.5) {
					lastgrab = Date.now();
					weapon[24][2] = playerpos[5];
					$currentConnection?.send({
						type: 'shooter.grab',
						d: weapon[24][2],
					});
					weapon[24][0] = playerpos[0];
					weapon[24][1] = playerpos[1] - playerpos[3] / 2;
				} else if (Date.now() - lastgrab >= 500 * 1.5) {
					$currentConnection?.send({
						type: 'shooter.ngrab',
					});
					weapon[24][0] = 0;
					weapon[24][1] = 0;
					weapon[24][2] = 0;
				}
			}
			if (
				p5.keyIsDown(90) &&
				Date.now() - lasttrap >= 1000 * 1.5 &&
				playerdata[3] > 0 &&
				vector[1] > 45 &&
				vector[1] <= 75
			) {
				lasttrap = Date.now();
				playerdata[3] -= 1;
				weapon[26 + (playerdata[2] % 4)][0] = playerpos[0];
				weapon[26 + (playerdata[2] % 4)][1] = playerpos[1] - playerpos[3] / 2;
				weapon[26 + (playerdata[2] % 4)][2] = 1;
			}
			if (p5.keyIsDown(69) && Date.now() - lastsmoke >= 1000 * 1.5 && playerdata[2] > 0) {
				lastsmoke = Date.now();
				playerdata[2] -= 1;
				weapon[20 + (playerdata[2] % 2)][2] = playerpos[5];
				$currentConnection?.send({
					type: 'shooter.smoke',
					d: weapon[20 + (playerdata[2] % 2)][2],
					o: playerdata[2] % 2,
				});
				weapon[20 + (playerdata[2] % 2)][0] = playerpos[0];
				weapon[20 + (playerdata[2] % 2)][1] = playerpos[1] - playerpos[3] / 2;
			}
		};
		$currentConnection?.on('shooter.pos', ({ pos }) => {
			enemypos = pos;
		});
		$currentConnection?.on('shooter.dead', ({}) => {
			playerpos = [150, 0, 30, 45, 0, 1];
			playerdata = [100, 50, 2, 1];
			refill = 0;
			playerpos[1] = 800;
			if ($currentConnection?.isHost) {
				playerpos[0] = 400;
			} else {
				playerpos[0] = 1300;
			}
			point[0] += 1;
		});

		$currentConnection?.on('shooter.boom', ({}) => {
			boom = Date.now();
			playerdata[0] -= 10;
		});
		let touch = 0;
		$currentConnection?.on('shooter.hit', ({ d }) => {
			vector[0] += 10 * d;
			if (touch < 200) {
				touch += 1;
			}
			playerdata[0] -= 1;
		});
		$currentConnection?.on('shooter.shoot', ({ o }) => {
			weapon[o + 10][0] = enemypos[0];
			weapon[o + 10][1] = enemypos[1] - enemypos[3] / 2;
			weapon[o + 10][2] = enemypos[5];
		});
		$currentConnection?.on('shooter.grab', ({ d }) => {
			weapon[25][0] = enemypos[0];
			weapon[25][1] = enemypos[1] - enemypos[3] / 2;
			weapon[25][2] = d;
		});
		$currentConnection?.on('shooter.smoke', ({ d, o }) => {
			weapon[22 + o][0] = enemypos[0];
			weapon[22 + o][1] = enemypos[1] - enemypos[3] / 2;
			weapon[22 + o][2] = d;
		});
		$currentConnection?.on('shooter.ngrab', ({}) => {
			weapon[25][0] = 0;
			weapon[25][1] = 0;
			weapon[25][2] = 0;
		});
		$currentConnection?.on('shooter.start', ({}) => {
			if (!start) {
				$currentConnection?.send({
					type: 'shooter.start',
				});
			}
			start = true;
		});
	};

	onMount(() => {
		new p5js(main);
	});

	onDestroy(() => {
		$currentConnection?.clear('shooter');
	});
</script>

<div id="background">
	<main
		id="p5-container"
		on:mousedown|preventDefault={() => {}}
		on:keypress|preventDefault={() => {}}
		on:contextmenu|preventDefault={() => {}}
	/>
</div>

<style>
	#background {
		background: url(/images/grass.jpg);
		background-size: 450px;
		display: grid;
		place-items: center;
		height: 100%;
	}
	#p5-container {
		/* width: 100%;
		height: 100%; */
		position: relative;
		aspect-ratio: 1/1;
		width: 100vmin;
	}
	:global(#p5-container canvas) {
		width: 100% !important;
		height: 100% !important;
		position: absolute;
	}
</style>
