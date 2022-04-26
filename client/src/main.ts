import './style.css'
import Phaser from 'phaser'
import { MainScene } from './scenes/mainScene'
import { StartScene } from './scenes/startScene'
import { Plugin as NineSlicePlugin } from 'phaser3-nineslice'
import { ConnectScene } from './scenes/connectScene'
import ClaimScene from './scenes/claimScene'

new Phaser.Game({
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
    }
  },
  pixelArt: true,
  scene: [StartScene, ConnectScene, MainScene, ClaimScene],
  plugins: {
    global: [NineSlicePlugin.DefaultCfg]
  }
})