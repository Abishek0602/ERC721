const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken - Royalty Balance Simulation", function () {
  let myToken;
  let owner, user1, user2, user3, user4, user5;

  beforeEach(async function () {
    [owner, user1, user2, user3, user4, user5] =
      await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy(owner.address);
    await myToken.waitForDeployment();
  });

  it("should track creator balance across 5 simulated sales", async function () {

    console.log("\n======================");
    console.log("NFT CREATION");
    console.log("======================");

    await myToken.connect(user1).Mint({
      value: await myToken.Token_Price()
    });

    const tokenId = 0;

    const creator = owner.address;

    console.log("Creator:", creator);

    // 🔥 OFF-CHAIN LEDGER (SIMULATION ONLY)
    let creatorBalance = 0n;

    console.log("\nInitial Creator Balance:", ethers.formatEther(creatorBalance), "ETH");

    console.log("\n======================");
    console.log("SECONDARY SALES SIMULATION");
    console.log("======================");

    let salePrice = ethers.parseEther("1");

    const buyers = [user2, user3, user4, user5, owner];

    for (let i = 0; i < buyers.length; i++) {

      console.log(`\n--- SALE ${i + 2} ---`);

      console.log("Buyer:", buyers[i].address);
      console.log("Sale Price:", ethers.formatEther(salePrice), "ETH");

      // 🔥 CALL ROYALTY LOGIC ONLY
      const royalty = await myToken.royaltyInfo(tokenId, salePrice);

      const receiver = royalty[0];
      const amount = royalty[1];

      console.log("Royalty Receiver:", receiver);
      console.log("Royalty Amount:", ethers.formatEther(amount), "ETH");

      // 🔥 TRACK CREATOR BALANCE (SIMULATION)
      if (receiver.toLowerCase() === creator.toLowerCase()) {
        creatorBalance += amount;
      }

      console.log("Creator Balance After Sale:", ethers.formatEther(creatorBalance), "ETH");

      // increase price
      salePrice = salePrice * 2n;
    }

    console.log("\n======================");
    console.log("FINAL RESULTS");
    console.log("======================");

    console.log("Creator Final Balance (After 5 Sales):",
      ethers.formatEther(creatorBalance),
      "ETH"
    );

    // Expected math check (5% royalties)
    // 1 ETH + 2 + 4 + 8 + 16 = 31 ETH total sales
    // 5% of each sale:
    // 0.05 + 0.1 + 0.2 + 0.4 + 0.8 = 1.55 ETH

    const expected = ethers.parseEther("1.55");

    expect(creatorBalance).to.equal(expected);

    console.log("\nExpected Creator Balance: 1.55 ETH ✔");
  });
});