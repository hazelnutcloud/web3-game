import { geckos } from '@geckos.io/client'
import { Scene } from 'phaser'
import { CONNECT_SCENE, MAIN_SCENE } from '../utils/keys'

export class ConnectScene extends Scene {
	constructor() {
		super(CONNECT_SCENE)
	}

	create() {
        //set bg color
        this.cameras.main.setBackgroundColor('0x171717')

		const { width, height } = this.scale
		const text = this.add.text(width * 0.5, height * 0.5, 'connecting to server...').setOrigin(0.5, 0.5)

		const channel = geckos({
			port: 9208,
		})
		channel.onConnect(error => {
			if (error) {
				console.error(error.message)
				text.setText(`error: ${error.message}`)
			}

			channel.on('ready', (initialPos) => {
				text.setText('connected!')
				setTimeout(() => {
					this.scene.start(MAIN_SCENE, { channel, initialPos })
				}, 500)
			})
		})
	}
}