import { ethers } from "ethers"
import { ClaimManagerERC721__factory, ClaimVerifier__factory } from "../contracts"
import { addresses } from "../../../commons/contracts.mjs"

const factories = {
    CLAIM_VERIFIER: ClaimVerifier__factory,
    DUNGEON: ClaimManagerERC721__factory
}

export const getContract = (name: string, signer: ethers.Signer) => {
    const factory = factories[name]
    const contract = new factory(signer).attach(addresses[name])
    return contract
}