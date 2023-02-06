import {
	settings,
	Application,
	Assets,
	Sprite,
	Graphics,
	Container,
	TextStyle,
	Text,
	DisplayObject
} from 'pixi.js';

export type Owner = 'self' | 'other' | 'clear';
export class Blob {
	// SETTINGS
	pos: { x: number; y: number };
	troops: number;
	owner: 'self' | 'other' | 'clear';

	// DISPLAY
	private container: Container;
	private label: Text;
	private graphic: Graphics;
	constructor(x: number, y: number, owner: Owner) {
		this.pos = { x, y };
		if (owner == 'clear') {
			this.troops = Math.round(Math.random() * 10);
		} else {
			this.troops = 10;
		}

		this.build();
	}

	register(stage: Container<DisplayObject>): void {
		stage.addChild(
			new Text('eeeeee', {
				fontFamily: 'Arial',
				fill: ['#ffffff']
			})
		);
		// stage.addChild(this.container);
	}

	private reBuild() {
		if (this.owner == 'self') this.graphic.beginFill(0x2ecc71);
		else if (this.owner == 'other') this.graphic.beginFill(0xe74c3c);
		else if (this.owner == 'clear') this.graphic.beginFill(0xbdc3c7);
		this.graphic.drawCircle(0, 0, 20 + this.troops);

		this.label.text = this.troops.toString();
		this.label.x = -this.label.width / 2;
		this.label.y = -this.label.height / 2;
	}
	private build() {
		this.container = new Container();
		this.container.x = this.pos.x;
		this.container.y = this.pos.y;

		this.graphic = new Graphics();
		this.label = new Text(this.troops.toString(), {
			fontFamily: 'Arial',
			fill: ['#ffffff']
		});

		this.container.addChild(this.graphic);
		this.container.addChild(this.label);

		this.reBuild();
	}
}
