import "@geckos.io/phaser-on-nodejs"
import geckos from '@geckos.io/server'
import config from './game/config.js'
import DungeonScene from './game/scenes/dungeonScene.js'

const io = geckos()

io.listen()

const sessions = new Map()

io.onConnection(channel => {
    console.log('client ', channel.id, 'joined')

    //create new game instance for each new player
    const game = new Phaser.Game(config)

    //set scene for game
    game.scene.add('dungeon', DungeonScene, true, { channel })

    //add game to sessions map
    sessions.set(channel.id, game)

    //delete sessions from sessions map after dc
    channel.onDisconnect(() => {
        sessions.delete(channel.id)
        console.log('client', channel.id, 'disconnected')
    })
})