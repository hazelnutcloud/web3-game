import Phaser from "phaser";
import { CLAIM_SCENE, COIN, COIN_SPIN, IDLE, KNIGHT, MAIN_SCENE, MOVE, SIGNER, TILEMAP, TILESET } from "../utils/keys";
import { ClientChannel } from "@geckos.io/client";
import { SnapshotInterpolation, Vault } from "@geckos.io/snapshot-interpolation";
import { getContract } from "../utils/contracts";
import { ethers } from "ethers";
import { ClaimManagerERC721 } from "../contracts";
import { addresses, contracts } from "../../../commons/contracts.mjs"

export class MainScene extends Phaser.Scene {
    player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    coin?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
    cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    wasd?: any
    lastDirectionIsLeft = false
    channel?: ClientChannel
    SI?: SnapshotInterpolation
    playerVault?: Vault
    initialPos?: Array<number>
    tick = 0
    balance?: ethers.BigNumber
    signer?: ethers.providers.JsonRpcSigner

    constructor() {
        super(MAIN_SCENE)
    }

    init({ channel, initialPos }: { channel: ClientChannel, initialPos: Array<number> }) {
        this.channel = channel
        this.initialPos = initialPos
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

        //signer
        this.signer = this.registry.get(SIGNER)
    }

    create() {
        //set bg color
        this.cameras.main.setBackgroundColor('0x171717')

        //snapshot interpolation
        this.SI = new SnapshotInterpolation(60)
        this.playerVault = new Vault()

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
        this.player = this.physics.add.sprite(this.initialPos![0], this.initialPos![1], KNIGHT)

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

        //server update handler
        this.channel?.on('update', (data: any) => {
            this.SI?.snapshot.add(data)
        })

        //claim handler
        this.channel?.on('claim', sig => {
            this.scene.get(CLAIM_SCENE).data.set('sig', sig)
            console.log(sig)
        })

        // pause physics when disconnected
        this.channel?.onDisconnect(() => {
            this.physics.pause()
        })

        this.getBalance()
    }

    update() {
        this.tick++

        //emit input to server
        const movement = [
            this.cursors?.up.isDown || this.wasd.W.isDown,
            this.cursors?.down.isDown || this.wasd.S.isDown,
            this.cursors?.left.isDown || this.wasd.A.isDown,
            this.cursors?.right.isDown || this.wasd.D.isDown
        ]
        this.channel?.emit('move', movement)

        //movement
        const [up, down, left, right] = movement
        if (up || down || left || right) {
            const playerSpeed = 80

            //up and down
            if (up && down) {
                this.player?.setVelocityY(0)
            } else if (up) {
                this.player?.setVelocityY(-playerSpeed)
            } else if (down) {
                this.player?.setVelocityY(playerSpeed)
            } else {
                this.player?.setVelocityY(0)
            }

            //left and right
            if (left && right) {
                this.player?.setVelocityX(0)
            } else if (left) {
                this.player?.setVelocityX(-playerSpeed)
                this.lastDirectionIsLeft = true
            } else if (right) {
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
            this.player?.setVelocity(0)
            this.player?.anims.play(IDLE, true)
        }

        //client prediction
        this.clientPrediction()

        //server reconciliation
        this.serverReconciliation(movement)
    }

    clientPrediction() {
        //add player vault snapshot
        this.playerVault?.add(
            this.SI!.snapshot.create(
                [{
                    id: this.channel!.id!,
                    x: this.player!.x,
                    y: this.player!.y
                }]
            )
        )
    }

    serverReconciliation(movement: Array<boolean>) {
        const [up, down, left, right] = movement

        if (this.player) {
            const serverSnapshot = this.SI!.vault.get()
            if (!serverSnapshot) return
            const playerSnapshot = this.playerVault?.get(serverSnapshot.time, true)

            if (serverSnapshot && playerSnapshot) {
                const serverPos = (serverSnapshot.state as any)[0]
                const playerPos = (playerSnapshot.state as any)[0]

                const offsetX = playerPos.x - serverPos.x
                const offsetY = playerPos.y - serverPos.y

                const isMoving = up || down || left || right

                const correction = isMoving ? 60 : 180

                this.player.setX(this.player.x - (offsetX / correction))
                this.player.setY(this.player.y - (offsetY / correction))
            }
        }
    }

    collectCoin() {
        setTimeout(() => {
            this.channel?.close()
        }, 30000)
        this.coin?.disableBody(true, true)
        this.cameras.main.setAlpha(0.5)
        this.scene.launch(CLAIM_SCENE, { contract: addresses.DUNGEON, balance: this.balance })
        this.scene.sendToBack(this)
    }

    async getBalance() {
        //get nft balance
        const manager = getContract(contracts.DUNGEON, this.signer!) as ClaimManagerERC721;
        const balance = await manager.balanceOf(await this.signer!.getAddress())
        this.balance = balance
        console.log(balance)
    }
}