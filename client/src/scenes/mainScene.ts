import Phaser from "phaser";
import { COIN, COIN_SPIN, IDLE, KNIGHT, MAIN_SCENE, MOVE, SIGNER, TILEMAP, TILESET } from "../utils/keys";
import { ethers } from 'ethers'

export class MainScene extends Phaser.Scene {
    player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    coin?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    wasd?: any
    lastDirectionIsLeft = false
    signer?: ethers.providers.JsonRpcSigner

    constructor() {
        super(MAIN_SCENE)
    }

    init() {
    }

    preload() {
        //assets
        this.load.spritesheet(KNIGHT, '/spritesheets/knight.png', { frameWidth: 15, frameHeight: 22 })
        this.load.image(TILESET, '/tilemap/tileset.png')
        this.load.tilemapTiledJSON(TILEMAP, '/tilemap/tilemap.json')
        this.load.spritesheet(COIN, '/spritesheets/coin.png', { frameWidth: 6, frameHeight: 7 })

        //inputs
        this.cursors = this.input.keyboard.createCursorKeys()
        this.wasd = this.input.keyboard.addKeys('W,S,A,D')
        this.signer = this.registry.get(SIGNER)
    }

    create() {
        //set bg color
        this.cameras.main.setBackgroundColor('0x171717')

        //tilemap and tileset
        const map = this.make.tilemap({ key: TILEMAP })
        const tiles = map.addTilesetImage('dungeon-tileset', TILESET)

        //tilemap layers
        const floor = map.createLayer('floor', tiles, 0, 0)
        const walls = map.createLayer('walls', tiles, 0, 0)
        const overhead = map.createLayer('overhead', tiles, 0, 0)

        //star sprite
        this.coin = this.physics.add.sprite(240, 70, COIN)

        //player sprite
        this.player = this.physics.add.sprite(240, 260, KNIGHT)

        //camera
        const camera = this.cameras.main
        camera.zoom = 3
        camera.startFollow(this.player)

        //anims
        this.anims.create({
            key: IDLE,
            frameRate: 10,
            frames: this.anims.generateFrameNumbers(KNIGHT, {
                start: 0,
                end: 3
            })
        })
        this.anims.create({
            key: MOVE,
            frameRate: 10,
            frames: this.anims.generateFrameNumbers(KNIGHT, {
                start: 4,
                end: 7
            })
        })
        this.anims.create({
            key: COIN_SPIN,
            frameRate: 10,
            frames: this.anims.generateFrameNumbers(COIN, {
                start: 0,
                end: 3,
            }),
            repeat: -1
        })

        //z-index
        floor.setDepth(0)
        walls.setDepth(10)
        this.player.setDepth(20)
        overhead.setDepth(30)

        //collision
        walls.setCollisionByProperty({ collides: true })
        this.physics.add.collider(this.player, walls)

        //overlap
        this.physics.add.overlap(this.player, this.coin, () => this.collectCoin())

        //start anims
        this.coin.anims.play(COIN_SPIN, true)
    }

    update() {
        //movement
        if ((this.cursors?.up.isDown || this.wasd?.W.isDown) || (this.cursors?.down.isDown || this.wasd.S.isDown) || (this.cursors?.right.isDown || this.wasd?.D.isDown) || (this.cursors?.left.isDown || this.wasd.A.isDown)) {
            const playerSpeed = 80

            //up and down
            if ((this.cursors?.up.isDown || this.wasd?.W.isDown) && (this.cursors?.down.isDown || this.wasd?.S.isDown)) {
                this.player?.setVelocityY(0)
            } else if (this.cursors?.up.isDown || this.wasd?.W.isDown) {
                this.player?.setVelocityY(-playerSpeed)
            } else if (this.cursors?.down.isDown || this.wasd?.S.isDown) {
                this.player?.setVelocityY(playerSpeed)
            } else {
                this.player?.setVelocityY(0)
            }

            //left and right
            if ((this.cursors?.left.isDown || this.wasd?.A.isDown) && (this.cursors?.right.isDown || this.wasd?.D.isDown)) {
                this.player?.setVelocityX(0)
            } else if (this.cursors?.left.isDown || this.wasd?.A.isDown) {
                this.player?.setVelocityX(-playerSpeed)
                this.lastDirectionIsLeft = true
            } else if (this.cursors?.right.isDown || this.wasd?.D.isDown) {
                this.player?.setVelocityX(playerSpeed)
                this.lastDirectionIsLeft = false
            } else {
                this.player?.setVelocityX(0)
            }

            //diagonals
            const velocity = this.player?.body.velocity
            if (velocity?.x != 0 && velocity?.y != 0) {
                this.player?.setVelocityX(velocity!.x * Math.sqrt(0.5))
                this.player?.setVelocityY(velocity!.y * Math.sqrt(0.5))
            }

            //animations
            if (velocity?.x != 0 || velocity.y != 0) {
                this.player?.setFlipX(this.lastDirectionIsLeft)
                this.player?.anims.play(MOVE, true)
            } else {
                this.player?.anims.play(IDLE, true)
            }
        } else {
            //idle
            this.player?.setVelocityX(0)
            this.player?.setVelocityY(0)
            this.player?.anims.play(IDLE, true)
        }
    }

    async collectCoin() {
        this.coin?.disableBody(true, true)
        console.log('yoink');
        const address = await this.signer?.getAddress()
        console.log(address);
    }
}