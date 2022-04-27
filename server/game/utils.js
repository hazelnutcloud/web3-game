import { contracts, addresses } from "../../commons/contracts.mjs"

export const signPacket = async (wallet, request, deadline, receiver) => {
    const domain = {
        name: "Web3Game",
        version: "1",
        chainId: 31337,
        verifyingContract: addresses[contracts.CLAIM_VERIFIER]
    }

    const types = {
        VerifyPacket: [
            { name: "request", type: "address" },
            { name: "deadline", type: "uint256" },
            { name: "receiver", type: "address" }
        ]
    }

    const value = {
        request,
        deadline,
        receiver
    }

    const sig = await wallet._signTypedData(domain, types, value)
    return sig
}