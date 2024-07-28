import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("CandleAuction", function () {
  async function deployAuctionFixture() {
    const [owner, bidder1, bidder2] = await ethers.getSigners();

    const CandleAuction = await ethers.getContractFactory("CandleAuction");
    const candleAuction = await CandleAuction.deploy();

    return { candleAuction, owner, bidder1, bidder2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { candleAuction, owner } = await loadFixture(deployAuctionFixture);
      expect(await candleAuction.owner()).to.equal(owner.address);
    });
  });

  describe("Creating Auction", function () {
    it("Should allow owner to create an auction", async function () {
      const { candleAuction, owner } = await loadFixture(deployAuctionFixture);
      await candleAuction.createAuction(3600); 
      expect(await candleAuction.getAuctionCount()).to.equal(1);
    });

    it("Should not allow non-owner to create an auction", async function () {
      const { candleAuction, bidder1 } = await loadFixture(deployAuctionFixture);
      await expect(candleAuction.connect(bidder1).createAuction(3600))
        .to.be.revertedWith("Only the owner can create auctions.");
    });
  });

  describe("Bidding", function () {
    it("Should allow placing a bid", async function () {
      const { candleAuction, owner, bidder1 } = await loadFixture(deployAuctionFixture);
      await candleAuction.createAuction(3600);
      await candleAuction.connect(bidder1).placeBid(0, { value: ethers.parseEther("1") });
      const auction = await candleAuction.getAuctionDetails(0);
      expect(auction._highestBidder).to.equal(bidder1.address);
      expect(auction._highestBid).to.equal(ethers.parseEther("1"));
    });

    it("Should not allow bids lower than current highest bid", async function () {
      const { candleAuction, owner, bidder1, bidder2 } = await loadFixture(deployAuctionFixture);
      await candleAuction.createAuction(3600);
      await candleAuction.connect(bidder1).placeBid(0, { value: ethers.parseEther("1") });
      await expect(candleAuction.connect(bidder2).placeBid(0, { value: ethers.parseEther("0.5") }))
        .to.be.revertedWith("There already is a higher bid.");
    });

    it("Should not allow bids after auction end time", async function () {
      const { candleAuction, owner, bidder1 } = await loadFixture(deployAuctionFixture);
      await candleAuction.createAuction(3600);
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");
      await expect(candleAuction.connect(bidder1).placeBid(0, { value: ethers.parseEther("1") }))
        .to.be.revertedWith("Auction already ended.");
    });
  });

  describe("Withdrawing", function () {
	it("Should allow withdrawing funds", async function () {
	  const { candleAuction, owner, bidder1, bidder2 } = await loadFixture(deployAuctionFixture);
	  await candleAuction.createAuction(3600);
	  await candleAuction.connect(bidder1).placeBid(0, { value: ethers.parseEther("1") });
	  await candleAuction.connect(bidder2).placeBid(0, { value: ethers.parseEther("2") });
	  
	  const initialBalance = await ethers.provider.getBalance(bidder1.address);
	  const tx = await candleAuction.connect(bidder1).withdraw();
	  const receipt = await tx.wait();
	  
	  // Calculate gas cost
	  const gasUsed = receipt!.gasUsed;
	  const gasPrice = await ethers.provider.getFeeData().then(fee => fee.gasPrice);
	  const gasCost = gasUsed * gasPrice!;
  
	  const finalBalance = await ethers.provider.getBalance(bidder1.address);
	  
	  const expectedBalance = initialBalance + ethers.parseEther("1") - gasCost;
	  expect(finalBalance).to.be.closeTo(
		expectedBalance,
		ethers.parseEther("0.01") // Allow for small discrepancies
	  );
	});
  });
  describe("Ending Auction", function () {
    it("Should allow ending the auction after end time", async function () {
      const { candleAuction, owner, bidder1 } = await loadFixture(deployAuctionFixture);
      await candleAuction.createAuction(3600);
      await candleAuction.connect(bidder1).placeBid(0, { value: ethers.parseEther("1") });
      
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");
      
      await expect(candleAuction.endAuction(0))
        .to.emit(candleAuction, "AuctionEnded")
        .withArgs(0, bidder1.address, ethers.parseEther("1"));
    });

    it("Should not allow ending the auction before end time", async function () {
      const { candleAuction, owner } = await loadFixture(deployAuctionFixture);
      await candleAuction.createAuction(3600);
      await expect(candleAuction.endAuction(0))
        .to.be.revertedWith("Auction not yet ended.");
    });

    it("Should not allow ending the auction twice", async function () {
      const { candleAuction, owner } = await loadFixture(deployAuctionFixture);
      await candleAuction.createAuction(3600);
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine");
      await candleAuction.endAuction(0);
      await expect(candleAuction.endAuction(0))
        .to.be.revertedWith("endAuction has already been called.");
    });
  });
});