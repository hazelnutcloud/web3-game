import nodePolyFills from 'rollup-plugin-polyfill-node'

const production = process.env.NODE_ENV === 'production'

/**
 * @type {import('vite').UserConfig}
 */
const config = {
    plugins: [
        !production && nodePolyFills({
            include: ['node_modules/**/*.js', new RegExp('node_modules/.vite/.*js')]
        })
    ],

    build: {
        rollupOptions: {
            plugins: [
                // ↓ Needed for build
                nodePolyFills()
            ]
        },
        // ↓ Needed for build if using WalletConnect and other providers
        commonjsOptions: {
            transformMixedEsModules: true
        }
    }
}

export default config