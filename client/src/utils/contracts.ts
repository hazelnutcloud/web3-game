import { ethers } from "ethers"
import { ClaimManagerERC721__factory, ClaimVerifier__factory } from "../contracts"

export const contracts = {
    CLAIM_VERIFIER: 'CLAIM_VERIFIER',
    DUNGEON: 'DUNGEON'
}

export const addresses = {
    CLAIM_VERIFIER: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    DUNGEON: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512'
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