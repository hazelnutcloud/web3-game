import { ethers } from 'ethers'
import Phaser from 'phaser'
import { ClaimVerifier } from '../contracts'
import { addresses, contracts, getContract } from '../utils/contracts'
import { BTN_GREY, CLAIM_SCENE, SIGNER, UPHEAVAL } from '../utils/keys'

export default class ClaimScene extends Phaser.Scene {
    button?: Phaser.GameObjects.RenderTexture
    text?: Phaser.GameObjects.BitmapText
    container?: Phaser.GameObjects.Container
    signer?: ethers.providers.JsonRpcSigner
    sig?: string = undefined
    contract?: string
    claimed = false
    balance?: ethers.BigNumber

    constructor() {
        super(CLAIM_SCENE)
    }

    init({ contract, balance }: { contract: string, balance: ethers.BigNumber }) {
        this.contract = contract
        this.balance = balance
    }

    preload() {
        this.load.bitmapFont(UPHEAVAL, '/fonts/upheaval.png', '/fonts/upheaval.xml')
        this.load.image(BTN_GREY, '/ui/btn-grey.png')
        this.signer = this.registry.get(SIGNER)
    }

    create() {
        //get screen height and width
        const { width, height } = this.scale

        //check if already claimed
        let text = 'waiting for server...'
        if (this.balance?.gt(0)) {
            text = 'already claimed!'
            this.claimed = true
        }

        //add components
        this.button = this.add.nineslice(0, 0, 135, 18, BTN_GREY, [3, 3, 5, 3]).setOrigin(0.5, 0.5).setScale(3, 3).setInteractive()
        this.text = this.add.bitmapText(0, 0, UPHEAVAL, text, 32).setOrigin(0.5, 0.5)
        this.container = this.add.container(width * 0.5, height * 0.4, [this.button, this.text])

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
            if (this.claimed) return
            this.claim()
        })

        this.data.events.on('setdata', scene => {
            if (this.claimed) return
            this.sig = scene.data.get('sig')
            this.text?.setText('claim nft')
        })
    }

    resize() {
        //recenter on resize
        const { width, height } = this.scale
        this.container?.setPosition(width * 0.5, height * 0.5)
    }

    async claim() {
        if (!this.sig) return
        const claimVerifier = getContract(contracts.CLAIM_VERIFIER, this.signer!) as ClaimVerifier
        const address = await this.signer!.getAddress()
        const request = addresses[contracts.DUNGEON]
        const deadline = ethers.constants.MaxUint256
        const receiver = address
        const { v, r, s } = ethers.utils.splitSignature(this.sig)
        try {
            const tx = await claimVerifier.claim(
                request,
                {
                    v,
                    r,
                    s,
                    request,
                    deadline,
                    receiver
                }
            )
            await tx.wait()
            this.claimed = true
            this.text?.setText('claimed!')
        } catch (error: any) {
            console.error(error)
        }
    }
}
