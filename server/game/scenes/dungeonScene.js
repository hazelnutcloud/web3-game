import Phaser from 'phaser'
import { SnapshotInterpolation } from '@geckos.io/snapshot-interpolation'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

export default class DungeonScene extends Phaser.Scene {
    channel
    player
    SI
    tick = 0

    constructor() {
        super('dungeon')
    }

    init({ channel }) {
        this.channel = channel
    }

    preload() {
        //load tilemap
        const __dirname = dirname(fileURLToPath(import.meta.url))
        this.load.tilemapTiledJSON('dungeon-tilemap', `/${__dirname}/../assets/tilemaps/tilemap.json`)
    }

    create() {
        //initialise snapshot interpolation
        this.SI = new SnapshotInterpolation()
        
        //initialise player
        this.player = this.physics.add.sprite(240, 260, '')
        this.player.setSize(15, 22)
        this.player.setCollideWorldBounds(true)

        //initialise tilemap
        const map = this.make.tilemap({
            key: 'dungeon-tilemap'
        })
        const walls = map.createLayer('walls', '', 0, 0)

        //set collison
        walls.setCollisionByProperty({ collides: true })
        this.physics.add.collider(this.player, walls)

        //add listeners
        this.channel.on('move', (data) => {
            //movement
            const [up, down, left, right] = data
            if (up || down || left || right) {
                const playerSpeed = 80

                //up and down
                if (up && down) {
                    this.player.setVelocityY(0)
                } else if (up) {
                    this.player.setVelocityY(-playerSpeed)
                } else if (down) {
                    this.player.setVelocityY(playerSpeed)
                } else {
                    this.player.setVelocityY(0)
                }

                //left and right
                if (left && right) {
                    this.player.setVelocityX(0)
                } else if (left) {
                    this.player.setVelocityX(-playerSpeed)
                } else if (right) {
                    this.player.setVelocityX(playerSpeed)
                } else {
                    this.player.setVelocityX(0)
                }

                //diagonals
                const velocity = this.player.body.velocity
                if (velocity.x != 0 && velocity.y != 0) {
                    this.player.setVelocityX(velocity.x * Math.sqrt(0.5))
                    this.player.setVelocityY(velocity.y * Math.sqrt(0.5))
                }
            } else {
                //idle
                this.player.setVelocityX(0)
                this.player.setVelocityY(0)
            }
        })

        //emit ready event to client when done
        this.channel.emit('ready', [240, 260])
    }

    update() {
        this.tick++

        //only send snapshot at half the server fps
        if (this.tick % 2 !== 0) return
        
        const snapshot = this.SI.snapshot.create([{id: this.channel.id, x: this.player.x, y: this.player.y}])

        this.channel.emit('update', snapshot)
    }
}