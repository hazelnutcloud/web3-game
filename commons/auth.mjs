export default function generateTypedAuth(secret) {
    const domain = {
        name: "web3 game",
        version: '1',
        chainId: 1,
    }

    const types = {
        Secret: [
            { name: 'secret', type: 'string' },
            { name: 'website', type: 'string' }
        ]
    }

    const value = {
        "website": 'web3-game.xyz',
        secret
    }

    return {
        domain,
        types,
        value
    }
}