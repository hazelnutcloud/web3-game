import "@geckos.io/phaser-on-nodejs"
import geckos from '@geckos.io/server'
import config from './game/config.js'
import DungeonScene from './game/scenes/dungeonScene.js'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { ethers } from "ethers"
import generateTypedAuth from '../commons/auth.mjs'

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.text())

const authRequest = new Map()

//request authentication secret
app.post("/authenticate", (req, res) => {
    //get address
    const address = req.body

    //delete previous secret
    authRequest.delete(address)

    //generate new secret
    const secret = ethers.utils.keccak256(ethers.utils.randomBytes(8))

    //set secret for address
    authRequest.set(address, secret)

    //return secret
    res.send(secret)
})

const io = geckos({
    //verify address used
    authorization: (auth, req, res) => {
        //split address and signature
        const token = auth.split(' ')
        const address = token[0]
        const sig = token[1]

        //get secret
        const secret = authRequest.get(address)

        //get typed data
        const { domain, types, value } = generateTypedAuth(secret)

        //get recovered address from typed data and signature
        const recoveredAddress = ethers.utils.verifyTypedData(domain, types, value, sig)

        if (recoveredAddress == address) {
            //verification successful
            authRequest.delete(address)
            return { address }
        } else {
            //verification unsuccessful
            authRequest.delete(address)
            return false
        }
    },
    cors: { allowAuthorization: true }
})

io.addServer(server)

server.listen(9208)

const sessions = new Map()

io.onConnection(channel => {
    console.log('client ', channel.id, 'joined')

    //create new game instance
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