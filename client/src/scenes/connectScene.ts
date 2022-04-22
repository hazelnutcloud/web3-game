import { Scene } from 'phaser'
import { CONNECT_SCENE, MAIN_SCENE } from '../utils/keys'

export class ConnectScene extends Scene {
	constructor() {
		super(CONNECT_SCENE)
	}

	create() {
		const { width, height } = this.scale

		this.add.text(width * 0.5, height * 0.5, 'connecting to server...').setOrigin(0.5, 0.5)
		setInterval(() => {
			this.scene.start(MAIN_SCENE)
		})
	}
}