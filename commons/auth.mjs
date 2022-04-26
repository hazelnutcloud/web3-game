export default function generateTypedAuth(challenge) {
    const domain = {
        name: "web3 game",
        version: '1',
        chainId: 4,
    }

    const types = {
        Challenge: [
            { name: 'challenge', type: 'string' },
            { name: 'website', type: 'string' }
        ]
    }

    const value = {
        "website": 'web3-game-nutcloud.vercel.app',
        challenge
    }

    return {
        domain,
        types,
        value
    }
}