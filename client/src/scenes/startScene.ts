import WalletConnectProvider from "@walletconnect/web3-provider"
import { ethers } from "ethers"
import Web3Modal from "web3modal"
import generateTypedAuth from "../../../commons/auth.mjs"
import { BTN_GREY, CONNECT_SCENE, SIGNER, UPHEAVAL } from "../utils/keys"

const connectWallet = async () => {
    const providerOptions = {
        walletconnect: {
            package: WalletConnectProvider,
            options: {
                infuraId: "0e7fcc143f894d179aa51dbdc44d8ac5"
            }
        },
        
    }

    const web3Modal = new Web3Modal({
        providerOptions
    })

    web3Modal.clearCachedProvider()

    let instance

    instance = await web3Modal.connect()

    const provider = new ethers.providers.Web3Provider(instance)

    const signer = provider.getSigner()
    return signer
}

export class StartScene extends Phaser.Scene {
    button?: Phaser.GameObjects.RenderTexture
    text?: Phaser.GameObjects.BitmapText
    container?: Phaser.GameObjects.Container
    signer?: ethers.providers.JsonRpcSigner

    constructor() {
        super({
            key: 'start-scene'
        })
    }

    preload() {
        this.load.bitmapFont(UPHEAVAL, '/fonts/upheaval.png', '/fonts/upheaval.xml')
        this.load.image(BTN_GREY, '/ui/btn-grey.png')
    }

    create() {
        //set bg color
        this.cameras.main.setBackgroundColor('0x171717')

        //get screen height and width
        const { width, height } = this.scale

        //add components
        this.button = this.add.nineslice(0, 0, 100, 18, BTN_GREY, [3, 3, 5, 3]).setOrigin(0.5, 0.5).setScale(3, 3).setInteractive()
        this.text = this.add.bitmapText(0, 0, UPHEAVAL, 'connect wallet', 32).setOrigin(0.5, 0.5)
        this.container = this.add.container(width * 0.5, height * 0.5, [this.button, this.text])

        //add event listeners
        this.scale.on('resize', () => this.resize())
        this.button.on('pointerover', () => {
            this.button?.setTint(0x44fff9)
        })
        this.button.on('pointerout', () => {
            this.button?.clearTint()
        })
        this.button.on('pointerdown', () => {
            this.button?.setTint(0x2aa19d)
        })
        this.button.on('pointerup', async () => {
            this.button?.clearTint()

            if (!this.signer) {
                try {
                    this.signer = await connectWallet()
                    if (this.signer) {
                        this.registry.set(SIGNER, this.signer)
                        this.text?.setText('login')
                    } else {
                        throw new Error('no provider')
                    }
                    return
                } catch (e) {
                    console.error(e)
                    return
                }
            }

            //login
            if (this.signer) this.authenticate()
        })
    }

    resize() {
        //recenter on resize
        const { width, height } = this.scale
        this.container?.setPosition(width * 0.5, height * 0.5)
    }

    async authenticate() {
        try {
            const address = await this.signer?.getAddress()

            //get secret
            const res = await fetch("http://localhost:9208/authenticate", {
                method: "POST",
                body: address,
            })
            if (!res.ok) {
                throw new Error(`${res.status} ${res.status}`)
            }
            const secret = await res.text()
            const { domain, types, value } = generateTypedAuth(secret)

            //generate signature
            const sig = await this.signer?._signTypedData(domain, types, value)
            
            this.scene.start(CONNECT_SCENE, { sig, address })
        } catch (e) {
            console.error(e)
        }
    }
}