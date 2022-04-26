import { ethers } from "ethers"
import { ClaimManagerERC721__factory, ClaimVerifier__factory } from "../contracts"

export const contracts = {
    CLAIM_VERIFIER: 'CLAIM_VERIFIER',
    DUNGEON: 'DUNGEON'
}

export const addresses = {
    CLAIM_VERIFIER: "0x4605C078DC7ecc262EB69E4eb3c732BcaEd52228",
    DUNGEON: '0x24b645D377348D7367586425A01080C8c6B82C1b'
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