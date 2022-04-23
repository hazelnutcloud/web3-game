import "@geckos.io/phaser-on-nodejs"
import Phaser from "phaser"

export default {
    type: Phaser.HEADLESS,
    width: 480,
    height: 320,
    banner: false,
    audio: {
        noAudio: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    }
}