const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying with account:", deployer.address);

    const MyToken = await hre.ethers.getContractFactory("NFT");

    const myToken = await MyToken.deploy(deployer.address);

    await myToken.waitForDeployment();

    const address = await myToken.getAddress();

    console.log("✅ MyToken deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});