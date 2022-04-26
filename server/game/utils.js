export const signPacket = async (wallet, request, deadline, receiver) => {
    const domain = {
        name: "Web3Game",
        version: "1",
        chainId: 4,
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

export const contracts = {
    CLAIM_VERIFIER: 'CLAIM_VERIFIER',
    DUNGEON: 'DUNGEON'
}

export const addresses = {
    CLAIM_VERIFIER: "0x4605C078DC7ecc262EB69E4eb3c732BcaEd52228",
    DUNGEON: '0x24b645D377348D7367586425A01080C8c6B82C1b'
}