<script lang="ts">
	import p5js from 'p5';
	import { onMount, onDestroy } from 'svelte';
	import { currentConnection } from '$lib/api/connection';
	import { goto } from '$app/navigation';

	import { Waiter } from '$lib/utils/time';

	const sendDelay = Waiter(500);
	const main = (p5: p5js) => {
		if (!$currentConnection) return goto('/');

		let shipa = [250, 500, 0, 0, 100, 0, 0];

		let bulleta = new Array(4);
		for (let i = 0; i < 4; i++) {
			bulleta[i] = new Array(4);
		}

		let shipb = [500, 500, 0, 0, 100, 0, 0];

		let bulletb = new Array(4);
		for (let i = 0; i < 4; i++) {
			bulletb[i] = new Array(4);
		}
		let time = 0;

		let data = new Array(2);
		for (let i = 0; i < 2; i++) {
			data[i] = new Array(3);
		}

		let start = false;
		p5.setup = () => {
			let canvas = p5.createCanvas(750, 750);
			// canvas.parent('p5-container');
			for (let i = 0; i < 4; i++) {
				bulleta[i][0] = -1;
			}
			if ($currentConnection?.isHost) {
				shipa[0] = 250;
			} else {
				shipa[0] = 500;
			}
			$currentConnection?.send({
				type: 'battleship.start',
			});
		};

		p5.draw = () => {
			p5.background(100, 100, 255);

			if (!start) return;

			if (sendDelay()) {
				$currentConnection?.send({
					type: 'battleship.pos',
					ship: shipa,
				});
			}
			if (shipb[4] < 0 || shipa[4] < 0) {
				p5.fill(150, 100, 25);
				p5.strokeWeight(10);
				p5.stroke(100, 50, 0);
				p5.rect(50, 50, p5.width - 100, p5.height - 100);
				p5.textSize(50);
				p5.fill(255, 255, 100);
				if (shipb[4] < 0) {
					p5.text('YOU WON', 100, 100);
				}
				if (shipa[4] < 0) {
					p5.text('YOU LOST', 100, 100);
				}
				p5.textSize(35);
				p5.fill(200, 150, 50);
				p5.text('Time (sec):', 100, 150);
				p5.text(p5.int(time), 300, 150);
				p5.textSize(20);
				p5.noStroke();
				for (let i = 0; i < 2; i++) {
					p5.fill(255 - i * 255, 0, i * 255);
					p5.rect(100, 200 + i * 135, p5.width - 200, 10);
					p5.fill(200, 150, 50);
					p5.text('bullet fired :', 100, 235 + i * 135);
					p5.text(data[i][0], 300, 235 + i * 135);
					p5.text('bullet hit :', 100, 260 + i * 135);
					p5.text(data[i][1], 300, 260 + i * 135);
					p5.text('bullet ratio :', 100, 285 + i * 135);
					if (data[i][0] != 0) {
						p5.text(data[i][1] / data[i][0], 300, 285 + i * 135);
					}
					p5.text('crashed the enemy :', 100, 310 + i * 135);
					p5.text(data[i][2], 300, 310 + i * 135);
				}
				if (p5.mouseIsPressed && $currentConnection?.isHost) {
					setTimeout(() => {
						$currentConnection?.send({
							type: 'battleship.res',
						});
						if ($currentConnection?.isHost) {
							shipa[0] = 250;
						} else {
							shipa[0] = 500;
						}
						shipb[0] = 500;
						shipa[1] = 500;
						shipa[2] = 0;
						shipa[3] = 0;
						shipa[4] = 100;

						shipb[1] = 500;
						shipb[2] = 0;
						shipb[3] = 0;
						shipb[4] = 100;

						time = 0;
						for (let i = 0; i < 2; i++) {
							for (let ii = 0; ii < 3; ii++) {
								data[i][ii] = 0;
							}
						}
					}, 1000);
				}
			} else {
				time += 1 / p5.frameRate();
				p5.fill(50, 50, 150);
				p5.strokeWeight(4);
				p5.stroke(50);
				// console.log(p5.cos(shipa[2] + p5.PI / 8) * 10 + p5.cos((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipa[0],
				// 	p5.sin(shipa[2] + p5.PI / 8) * 10 + p5.sin((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipa[1],
				// 	p5.cos(shipa[2] - p5.PI / 8) * 10 + p5.cos((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipa[0],
				// 	p5.sin(shipa[2] - p5.PI / 8) * 10 + p5.sin((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipa[1]);

				p5.line(
					p5.cos(shipa[2] + p5.PI / 8) * 10 +
						p5.cos((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipa[0],
					p5.sin(shipa[2] + p5.PI / 8) * 10 +
						p5.sin((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipa[1],
					p5.cos(shipa[2] - p5.PI / 8) * 10 +
						p5.cos((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipa[0],
					p5.sin(shipa[2] - p5.PI / 8) * 10 +
						p5.sin((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipa[1]
				);
				p5.line(
					p5.cos(shipa[2] + p5.PI / 16) * 20 +
						p5.cos((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipa[0],
					p5.sin(shipa[2] + p5.PI / 16) * 20 +
						p5.sin((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipa[1],
					p5.cos(shipa[2] - p5.PI / 16) * 20 +
						p5.cos((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipa[0],
					p5.sin(shipa[2] - p5.PI / 16) * 20 +
						p5.sin((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipa[1]
				);

				p5.line(
					p5.cos(shipb[2] + p5.PI / 8) * 10 +
						p5.cos((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipb[0],
					p5.sin(shipb[2] + p5.PI / 8) * 10 +
						p5.sin((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipb[1],
					p5.cos(shipb[2] - p5.PI / 8) * 10 +
						p5.cos((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipb[0],
					p5.sin(shipb[2] - p5.PI / 8) * 10 +
						p5.sin((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipb[1]
				);
				p5.line(
					p5.cos(shipb[2] + p5.PI / 16) * 20 +
						p5.cos((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipb[0],
					p5.sin(shipb[2] + p5.PI / 16) * 20 +
						p5.sin((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipb[1],
					p5.cos(shipb[2] - p5.PI / 16) * 20 +
						p5.cos((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipb[0],
					p5.sin(shipb[2] - p5.PI / 16) * 20 +
						p5.sin((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipb[1]
				);

				p5.fill(150, 100, 25);
				p5.strokeWeight(2.5);
				p5.stroke(100, 50, 0);
				p5.triangle(
					shipa[0],
					shipa[1],
					p5.cos((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipa[0],
					p5.sin((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipa[1],
					p5.cos((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipa[0],
					p5.sin((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipa[1]
				);
				p5.quad(
					p5.cos((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipa[0],
					p5.sin((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipa[1],
					p5.cos((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipa[0],
					p5.sin((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipa[1],
					p5.cos(shipa[2]) * 32 + p5.cos((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipa[0],
					p5.sin(shipa[2]) * 32 + p5.sin((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipa[1],
					p5.cos(shipa[2]) * 32 + p5.cos((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipa[0],
					p5.sin(shipa[2]) * 32 + p5.sin((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipa[1]
				);
				p5.quad(
					p5.cos(shipa[2]) * 32 + p5.cos((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipa[0],
					p5.sin(shipa[2]) * 32 + p5.sin((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipa[1],
					p5.cos(shipa[2]) * 32 + p5.cos((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipa[0],
					p5.sin(shipa[2]) * 32 + p5.sin((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipa[1],
					p5.cos(shipa[2] + p5.PI / 16) * 24 +
						p5.cos(shipa[2]) * 32 +
						p5.cos((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipa[0],
					p5.sin(shipa[2] + p5.PI / 16) * 24 +
						p5.sin(shipa[2]) * 32 +
						p5.sin((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipa[1],
					p5.cos(shipa[2] - p5.PI / 16) * 24 +
						p5.cos(shipa[2]) * 32 +
						p5.cos((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipa[0],
					p5.sin(shipa[2] - p5.PI / 16) * 24 +
						p5.sin(shipa[2]) * 32 +
						p5.sin((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipa[1]
				);

				p5.triangle(
					shipb[0],
					shipb[1],
					p5.cos((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipb[0],
					p5.sin((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipb[1],
					p5.cos((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipb[0],
					p5.sin((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipb[1]
				);
				p5.quad(
					p5.cos((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipb[0],
					p5.sin((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipb[1],
					p5.cos((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipb[0],
					p5.sin((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipb[1],
					p5.cos(shipb[2]) * 32 + p5.cos((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipb[0],
					p5.sin(shipb[2]) * 32 + p5.sin((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipb[1],
					p5.cos(shipb[2]) * 32 + p5.cos((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipb[0],
					p5.sin(shipb[2]) * 32 + p5.sin((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipb[1]
				);
				p5.quad(
					p5.cos(shipb[2]) * 32 + p5.cos((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipb[0],
					p5.sin(shipb[2]) * 32 + p5.sin((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 + shipb[1],
					p5.cos(shipb[2]) * 32 + p5.cos((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipb[0],
					p5.sin(shipb[2]) * 32 + p5.sin((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 + shipb[1],
					p5.cos(shipb[2] + p5.PI / 16) * 24 +
						p5.cos(shipb[2]) * 32 +
						p5.cos((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipb[0],
					p5.sin(shipb[2] + p5.PI / 16) * 24 +
						p5.sin(shipb[2]) * 32 +
						p5.sin((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipb[1],
					p5.cos(shipb[2] - p5.PI / 16) * 24 +
						p5.cos(shipb[2]) * 32 +
						p5.cos((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipb[0],
					p5.sin(shipb[2] - p5.PI / 16) * 24 +
						p5.sin(shipb[2]) * 32 +
						p5.sin((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipb[1]
				);

				p5.strokeWeight(4);
				p5.circle(p5.cos(shipa[2]) * 34 + shipa[0], p5.sin(shipa[2]) * 34 + shipa[1], 6);
				p5.line(
					p5.cos(shipa[2] + p5.PI / 3) * 5 +
						p5.cos((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipa[0],
					p5.sin(shipa[2] + p5.PI / 3) * 5 +
						p5.sin((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipa[1],
					p5.cos(shipa[2] - p5.PI / 3) * 5 +
						p5.cos((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipa[0],
					p5.sin(shipa[2] - p5.PI / 3) * 5 +
						p5.sin((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipa[1]
				);
				p5.circle(p5.cos(shipa[2]) * 66 + shipa[0], p5.sin(shipa[2]) * 66 + shipa[1], 6);
				p5.line(
					p5.cos(shipa[2] + p5.PI / 18) * 36 +
						p5.cos((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipa[0],
					p5.sin(shipa[2] + p5.PI / 18) * 36 +
						p5.sin((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipa[1],
					p5.cos(shipa[2] - p5.PI / 18) * 36 +
						p5.cos((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipa[0],
					p5.sin(shipa[2] - p5.PI / 18) * 36 +
						p5.sin((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipa[1]
				);

				p5.circle(p5.cos(shipb[2]) * 34 + shipb[0], p5.sin(shipb[2]) * 34 + shipb[1], 6);

				p5.line(
					p5.cos(shipb[2] + p5.PI / 3) * 5 +
						p5.cos((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipb[0],
					p5.sin(shipb[2] + p5.PI / 3) * 5 +
						p5.sin((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipb[1],
					p5.cos(shipb[2] - p5.PI / 3) * 5 +
						p5.cos((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipb[0],
					p5.sin(shipb[2] - p5.PI / 3) * 5 +
						p5.sin((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipb[1]
				);
				p5.circle(p5.cos(shipb[2]) * 66 + shipb[0], p5.sin(shipb[2]) * 66 + shipb[1], 6);
				p5.line(
					p5.cos(shipb[2] + p5.PI / 18) * 36 +
						p5.cos((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipb[0],
					p5.sin(shipb[2] + p5.PI / 18) * 36 +
						p5.sin((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
						shipb[1],
					p5.cos(shipb[2] - p5.PI / 18) * 36 +
						p5.cos((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipb[0],
					p5.sin(shipb[2] - p5.PI / 18) * 36 +
						p5.sin((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
						shipb[1]
				);

				p5.strokeWeight(3);
				p5.stroke(225);
				p5.noFill();
				p5.arc(
					p5.cos(shipa[2]) * 64 + shipa[0],
					p5.sin(shipa[2]) * 64 + shipa[1],
					74,
					74,
					shipa[2] - p5.PI / 6 - p5.PI,
					shipa[2] + p5.PI / 6 - p5.PI
				);
				p5.arc(
					p5.cos(shipa[2]) * 96 + shipa[0],
					p5.sin(shipa[2]) * 96 + shipa[1],
					74,
					74,
					shipa[2] - p5.PI / 6 - p5.PI,
					shipa[2] + p5.PI / 6 - p5.PI
				);

				p5.arc(
					p5.cos(shipb[2]) * 64 + shipb[0],
					p5.sin(shipb[2]) * 64 + shipb[1],
					74,
					74,
					shipb[2] - p5.PI / 6 - p5.PI,
					shipb[2] + p5.PI / 6 - p5.PI
				);
				p5.arc(
					p5.cos(shipb[2]) * 96 + shipb[0],
					p5.sin(shipb[2]) * 96 + shipb[1],
					74,
					74,
					shipb[2] - p5.PI / 6 - p5.PI,
					shipb[2] + p5.PI / 6 - p5.PI
				);

				if (p5.keyIsDown(18)) var factor = 3;
				else var factor = 1;
				shipa[5] += p5.cos(shipa[2]) * -1 * factor;
				shipa[6] += p5.sin(shipa[2]) * -1 * factor;
				shipa[0] += shipa[5] / 50;
				shipa[1] += shipa[6] / 50;
				shipa[5] *= 0.99;
				shipa[6] *= 0.99;

				shipb[5] += p5.cos(shipb[2]) * -1;
				shipb[6] += p5.sin(shipb[2]) * -1;
				shipb[0] += shipb[5] / 50;
				shipb[1] += shipb[6] / 50;
				shipb[5] *= 0.99;
				shipb[6] *= 0.99;

				p5.noStroke();
				for (let i = 0; i < 4; i++) {
					if (bulleta[i][0] >= 10) {
						for (let ii = 0; ii < 5; ii++) {
							p5.fill(255 - ii * 10, 155 + ii * 10, 100, 200);
							p5.circle(
								bulleta[i][1] - ((p5.cos(bulleta[i][3]) * bulleta[i][0]) / 5) * ii * 2,
								bulleta[i][2] - ((p5.sin(bulleta[i][3]) * bulleta[i][0]) / 5) * ii * 2,
								5 - ii
							);
						}
						p5.fill(10);
						p5.circle(bulleta[i][1], bulleta[i][2], 5);
						bulleta[i][1] += (p5.cos(bulleta[i][3]) * bulleta[i][0]) / 5;
						bulleta[i][2] += (p5.sin(bulleta[i][3]) * bulleta[i][0]) / 5;
						if ((p5.int(time * 10) / 10) % 1 == 0) {
							bulleta[i][0] -= 1;
						}
						if (
							(bulleta[i][1] > p5.cos(shipb[2]) * 34 + shipb[0] - 16 &&
								bulleta[i][1] < p5.cos(shipb[2]) * 34 + shipb[0] + 16 &&
								bulleta[i][2] > p5.sin(shipb[2]) * 34 + shipb[1] - 16 &&
								bulleta[i][2] < p5.sin(shipb[2]) * 34 + shipb[1] + 16) ||
							(bulleta[i][1] > p5.cos(shipb[2]) * 66 + shipb[0] - 16 &&
								bulleta[i][1] < p5.cos(shipb[2]) * 66 + shipb[0] + 16 &&
								bulleta[i][2] > p5.sin(shipb[2]) * 66 + shipb[1] - 16 &&
								bulleta[i][2] < p5.sin(shipb[2]) * 66 + shipb[1] + 16)
						) {
							shipb[4] -= 5;
							bulleta[i][0] = 0;
							data[0][1] += 2;
							$currentConnection?.send({
								type: 'battleship.hit',
							});
						}
					} else if ((p5.int(time * 10) / 10) % 1 == 0 && shipa[3] > 0) {
						shipa[3] -= 1;
					}
					if (bulletb[i][0] >= 10) {
						for (let ii = 0; ii < 5; ii++) {
							p5.fill(255 - ii * 10, 155 + ii * 10, 100, 200);
							p5.circle(
								bulletb[i][1] - ((p5.cos(bulletb[i][3]) * bulletb[i][0]) / 5) * ii * 2,
								bulletb[i][2] - ((p5.sin(bulletb[i][3]) * bulletb[i][0]) / 5) * ii * 2,
								5 - ii
							);
						}
						p5.fill(10);
						p5.circle(bulletb[i][1], bulletb[i][2], 5);
						bulletb[i][1] += (p5.cos(bulletb[i][3]) * bulletb[i][0]) / 5;
						bulletb[i][2] += (p5.sin(bulletb[i][3]) * bulletb[i][0]) / 5;
						if ((p5.int(time * 10) / 10) % 1 == 0) {
							bulletb[i][0] -= 1;
						}
					} else if ((p5.int(time * 10) / 10) % 1 == 0 && shipb[3] > 0) {
						shipb[3] = -1;
					}
				}

				if (shipa[0] < -32) {
					shipa[0] = p5.width;
				}
				if (shipa[0] > p5.width + 32) {
					shipa[0] = 0;
				}
				if (shipa[1] < -32) {
					shipa[1] = p5.height;
				}
				if (shipa[1] > p5.height + 32) {
					shipa[1] = 0;
				}
				if (shipb[0] < -32) {
					shipb[0] = p5.width;
				}
				if (shipb[0] > p5.width + 32) {
					shipb[0] = 0;
				}
				if (shipb[1] < -32) {
					shipb[1] = p5.height;
				}
				if (shipb[1] > p5.height + 32) {
					shipb[1] = 0;
				}

				if (p5.mouseIsPressed) {
					if (p5.mouseButton == p5.LEFT) {
						shipa[2] += p5.PI / 192;
						$currentConnection?.send({
							type: 'battleship.pos',
							ship: shipa,
						});
					} else if (p5.mouseButton == p5.RIGHT) {
						shipa[2] -= p5.PI / 192;
						$currentConnection?.send({
							type: 'battleship.pos',
							ship: shipa,
						});
					}
				}

				p5.stroke(50, 0, 0);
				p5.fill(100, 25, 25);
				p5.rect(20, 10, 200, 10);
				p5.rect(p5.width - 20, 10, -200, 10);

				p5.fill(100, 255, 100);
				p5.stroke(50, 150, 50);
				p5.rect(20, 10, 2 * shipa[4], 10);
				p5.rect(p5.width - 20, 10, -2 * shipb[4], 10);

				if ($currentConnection?.isHost) {
					p5.fill(255, 100, 100);
					p5.stroke(100, 50, 50);
				} else {
					p5.fill(100, 100, 255);
					p5.stroke(50, 50, 100);
				}
				p5.strokeWeight(2);

				p5.circle(15, 15, 15);
				p5.circle(shipa[0] + p5.cos(shipa[2]) * 48, shipa[1] + p5.sin(shipa[2]) * 48, 10);

				if ($currentConnection?.isHost) {
					p5.fill(100, 100, 255);
					p5.stroke(50, 50, 100);
				} else {
					p5.fill(255, 100, 100);
					p5.stroke(100, 50, 50);
				}

				p5.circle(p5.width - 15, 15, 15);
				p5.circle(shipb[0] + p5.cos(shipb[2]) * 48, shipb[1] + p5.sin(shipb[2]) * 48, 10);

				if (
					(shipb[0] > p5.cos(shipa[2]) * 34 + shipa[0] - 16 &&
						shipb[0] < p5.cos(shipa[2]) * 34 + shipa[0] + 16 &&
						shipb[1] > p5.sin(shipa[2]) * 34 + shipa[1] - 16 &&
						shipb[1] < p5.sin(shipa[2]) * 34 + shipa[1] + 16) ||
					(shipb[0] > p5.cos(shipa[2]) * 66 + shipa[0] - 16 &&
						shipb[0] < p5.cos(shipa[2]) * 66 + shipa[0] + 16 &&
						shipb[1] > p5.sin(shipa[2]) * 66 + shipa[1] - 16 &&
						shipb[1] < p5.sin(shipa[2]) * 66 + shipa[1] + 16)
				) {
					shipa[4] -= 3;
					shipb[4] -= 0.5;
					shipb[5] += p5.cos(shipb[2]) * 50;
					shipb[6] += p5.sin(shipb[2]) * 50;
					data[1][2] += 1;
				}
				if (
					(shipa[0] > p5.cos(shipb[2]) * 34 + shipb[0] - 16 &&
						shipa[0] < p5.cos(shipb[2]) * 34 + shipb[0] + 16 &&
						shipa[1] > p5.sin(shipb[2]) * 34 + shipb[1] - 16 &&
						shipa[1] < p5.sin(shipb[2]) * 34 + shipb[1] + 16) ||
					(shipa[0] > p5.cos(shipb[2]) * 66 + shipb[0] - 16 &&
						shipa[0] < p5.cos(shipb[2]) * 66 + shipb[0] + 16 &&
						shipa[1] > p5.sin(shipb[2]) * 66 + shipb[1] - 16 &&
						shipa[1] < p5.sin(shipb[2]) * 66 + shipb[1] + 16)
				) {
					shipa[4] -= 0.5;
					shipb[4] -= 3;
					shipa[5] += p5.cos(shipa[2]) * 50;
					shipa[6] += p5.sin(shipa[2]) * 50;
					data[0][2] += 1;
				}
			}
		};

		let lastShoot = 0;
		p5.keyPressed = () => {
			if (p5.keyIsDown(32) && Date.now() - lastShoot >= 1000 * 1.5) {
				$currentConnection?.send({
					type: 'battleship.shoot',
				});

				lastShoot = Date.now();

				data[0][0] += 1;
				shipa[3] = 100;
				for (let i = 0; i < 4; i++) {
					bulleta[i][0] = 50;
				}
				for (let i = 0; i < 2; i++) {
					bulleta[i][3] = shipa[2] + p5.PI / 2;
				}
				for (let i = 2; i < 4; i++) {
					bulleta[i][3] = shipa[2] - p5.PI / 2;
				}
				bulleta[0][1] =
					p5.cos(shipa[2] + p5.PI / 8) * 10 +
					p5.cos((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
					shipa[0];
				bulleta[1][1] =
					p5.cos(shipa[2] + p5.PI / 16) * 20 +
					p5.cos((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
					shipa[0];
				bulleta[2][1] =
					p5.cos(shipa[2] - p5.PI / 8) * 10 +
					p5.cos((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
					shipa[0];
				bulleta[3][1] =
					p5.cos(shipa[2] - p5.PI / 16) * 20 +
					p5.cos((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
					shipa[0];

				bulleta[0][2] =
					p5.sin(shipa[2] + p5.PI / 8) * 10 +
					p5.sin((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
					shipa[1];
				bulleta[1][2] =
					p5.sin(shipa[2] + p5.PI / 16) * 20 +
					p5.sin((shipa[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
					shipa[1];
				bulleta[2][2] =
					p5.sin(shipa[2] - p5.PI / 8) * 10 +
					p5.sin((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
					shipa[1];
				bulleta[3][2] =
					p5.sin(shipa[2] - p5.PI / 16) * 20 +
					p5.sin((shipa[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
					shipa[1];
			}
		};
		$currentConnection?.on('battleship.pos', ({ ship }) => {
			shipb = ship;
		});
		$currentConnection?.on('battleship.start', ({}) => {
			if (!start) {
				$currentConnection?.send({
					type: 'battleship.start',
				});
			}
			start = true;
		});
		$currentConnection?.on('battleship.res', ({}) => {
			shipa[0] = 250;
			shipa[1] = 500;
			shipa[2] = 0;
			shipa[3] = 0;
			shipa[4] = 100;

			shipb[0] = 500;
			shipb[1] = 500;
			shipb[2] = 0;
			shipb[3] = 0;
			shipb[4] = 100;

			time = 0;
			for (let i = 0; i < 2; i++) {
				for (let ii = 0; ii < 3; ii++) {
					data[i][ii] = 0;
				}
			}
		});
		$currentConnection?.on('battleship.hit', ({}) => {
			shipa[4] -= 5;
			$currentConnection?.send({
				type: 'battleship.pos',
				ship: shipa,
			});
		});
		$currentConnection?.on('battleship.shoot', () => {
			data[1][0] += 1;
			shipb[3] = 100;
			for (let i = 0; i < 4; i++) {
				bulletb[i][0] = 50;
			}
			for (let i = 0; i < 2; i++) {
				bulletb[i][3] = shipb[2] + p5.PI / 2;
			}
			for (let i = 2; i < 4; i++) {
				bulletb[i][3] = shipb[2] - p5.PI / 2;
			}
			bulletb[0][1] =
				p5.cos(shipb[2] + p5.PI / 8) * 10 +
				p5.cos((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
				shipb[0];
			bulletb[1][1] =
				p5.cos(shipb[2] + p5.PI / 16) * 20 +
				p5.cos((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
				shipb[0];
			bulletb[2][1] =
				p5.cos(shipb[2] - p5.PI / 8) * 10 +
				p5.cos((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
				shipb[0];
			bulletb[3][1] =
				p5.cos(shipb[2] - p5.PI / 16) * 20 +
				p5.cos((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
				shipb[0];

			bulletb[0][2] =
				p5.sin(shipb[2] + p5.PI / 8) * 10 +
				p5.sin((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
				shipb[1];
			bulletb[1][2] =
				p5.sin(shipb[2] + p5.PI / 16) * 20 +
				p5.sin((shipb[2] % (p5.PI * 2)) + p5.PI / 8) * 32 +
				shipb[1];
			bulletb[2][2] =
				p5.sin(shipb[2] - p5.PI / 8) * 10 +
				p5.sin((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
				shipb[1];
			bulletb[3][2] =
				p5.sin(shipb[2] - p5.PI / 16) * 20 +
				p5.sin((shipb[2] % (p5.PI * 2)) - p5.PI / 8) * 32 +
				shipb[1];
		});
	};

	onMount(() => {
		new p5js(main);
	});

	onDestroy(() => {
		$currentConnection?.clear('battleship');
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
