import { ethers } from "ethers"
import { ClaimManagerERC721__factory, ClaimVerifier__factory } from "../contracts"

export const contracts = {
    CLAIM_VERIFIER: 'CLAIM_VERIFIER',
    DUNGEON: 'DUNGEON'
}

export const addresses = {
    CLAIM_VERIFIER: "0x699Ea89DC67CcFe3565ABF6910acdFCa15436eC0",
    DUNGEON: '0x600f681d0987C06888e123bd7C00564808909FFc'
}

const factories = {
    CLAIM_VERIFIER: ClaimVerifier__factory,
    DUNGEON: ClaimManagerERC721__factory
}

export const getContract = (name: string, signer: ethers.Signer) => {
    const factory = factories[name]
    const contract = new factory(signer).attach(addresses[name])
    return contract
}