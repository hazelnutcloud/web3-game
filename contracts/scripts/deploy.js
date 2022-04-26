const { ethers } = require("hardhat")

async function main() {
    const [deployer] = await ethers.getSigners()
    const deployerAddress = await deployer.getAddress()
    console.log("deployer address: ", deployerAddress)

    const ClaimVerifier = await ethers.getContractFactory('ClaimVerifier')
    const claimVerifier = await ClaimVerifier.deploy()
    await claimVerifier.deployed()

    const ClaimManagerERC721 = await ethers.getContractFactory('ClaimManagerERC721')
    const claimManagerERC721 = await ClaimManagerERC721.deploy('Coin', 'COIN', 'web3-game-nutcloud-vercel.app', claimVerifier.address)
    await claimManagerERC721.deployed()

    let tx = await claimVerifier.setIsTrusted("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", true)
    await tx.wait()

    tx = await claimVerifier.setIsClaimManager(claimManagerERC721.address, true);
    await tx.wait()

    console.log(
        "ClaimVerifier deployed to: ", claimVerifier.address,
        "ClaimManagerERC721 deployed to: ", claimManagerERC721.address,
        "Set trusted signer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    )
}

main()
    .then(() => process.exit(0))
    .catch(e => {
        console.error(e)
        process.exit(1)
    })