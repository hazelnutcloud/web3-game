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

export const contracts = {
    CLAIM_VERIFIER: 'CLAIM_VERIFIER',
    DUNGEON: 'DUNGEON'
}

export const addresses = {
    CLAIM_VERIFIER: "0x5fbdb2315678afecb367f032d93f642f64180aa3",
    DUNGEON: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512'
}