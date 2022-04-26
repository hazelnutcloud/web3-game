export const signPacket = async (wallet, request, deadline, receiver) => {
    const domain = {
        name: "Web3Game",
        version: "1",
        chainId: 421611,
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
    CLAIM_VERIFIER: "0x699Ea89DC67CcFe3565ABF6910acdFCa15436eC0",
    DUNGEON: '0x600f681d0987C06888e123bd7C00564808909FFc'
}