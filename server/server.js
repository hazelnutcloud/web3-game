import "@geckos.io/phaser-on-nodejs"
import geckos from '@geckos.io/server'
import config from './game/config.js'
import DungeonScene from './game/scenes/dungeonScene.js'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { ethers } from "ethers"
import generateTypedAuth from '../commons/auth.mjs'
import dotenv from 'dotenv'
import { iceServers } from "@geckos.io/server"

dotenv.config()

const app = express()
const server = http.createServer(app)

app.use(cors())
app.use(express.text())

const authRequest = new Map()
const sessions = new Map()

//generate signer
const wallet = process.env.NODE_ENV === 'production' ? ethers.Wallet.createRandom() : new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80")
let signerAddress
wallet.getAddress().then(address => {
    console.log("trusted address: ", address)
    signerAddress = address
})

//GET signer address
app.get("/signer", (req, res) => {
    res.setHeader('Content-Type', 'text/plain')
    res.send(signerAddress ? signerAddress : 'generating..')
})

//request authentication secret
app.post("/challenge", (req, res) => {
    //get address
    const address = req.body

    //delete previous secret
    authRequest.delete(address)

    //generate new secret
    const secret = ethers.utils.keccak256(ethers.utils.randomBytes(8))

    //set secret for address
    authRequest.set(address, secret)

    //return secret
    res.setHeader('Content-Type', 'text/plain')
    res.send(secret)
})

const io = geckos({
    //verify address used
    authorization: (auth, req, res) => {
        //split address and signature
        const token = auth.split(' ')
        const address = token[0]
        const sig = token[1]

        if (sessions.has(address)) {
            //address already in session
            console.log("session in progress")
            authRequest.delete(address)
            return false
        }

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
        }
        //verification unsuccessful
        console.log(address)
        authRequest.delete(address)
        return false
    },
    cors: { allowAuthorization: true },
    iceServers: process.env.NODE_ENV === 'production' ? iceServers : []
})

io.addServer(server)

io.onConnection(channel => {
    console.log(channel.userData.address, 'joined')

    //create new game instance
    const game = new Phaser.Game(config)

    //set scene for game
    game.scene.add('dungeon', DungeonScene, true, { channel, wallet })

    //add game to sessions map
    sessions.set(channel.userData.address, game)

    //delete sessions from sessions map after dc
    channel.onDisconnect(() => {
        sessions.delete(channel.userData.address)
        console.log(channel.userData.address, 'disconnected')
    })
})

server.listen(9208, () => {
    console.log("listening on port 9208")
})