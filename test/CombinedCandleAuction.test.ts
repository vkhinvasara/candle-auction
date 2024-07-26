import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { CombinedCandleAuction } from "../typechain-types";

describe("CombinedCandleAuction", function () {
  async function deployAuctionFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const CombinedCandleAuction = await ethers.getContractFactory("CombinedCandleAuction");
    const auction = await CombinedCandleAuction.deploy();

    return { auction, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { auction, owner } = await loadFixture(deployAuctionFixture);
      expect(await auction.getOwner()).to.equal(owner.address);
    });

    it("Should start with zero auctions", async function () {
      const { auction } = await loadFixture(deployAuctionFixture);
      expect(await auction.auctionCount()).to.equal(0);
    });
  });

  describe("Creating and Starting Auction", function () {
    it("Should create a new auction with item name", async function () {
      const { auction, addr1 } = await loadFixture(deployAuctionFixture);
      await expect(auction.connect(addr1).createNewAuction("Vintage Watch"))
        .to.emit(auction, "AuctionCreated")
        .withArgs(0, addr1.address, "Vintage Watch");
      expect(await auction.auctionCount()).to.equal(1);

      const auctionInfo = await auction.getAuction(0);
      expect(auctionInfo.itemName).to.equal("Vintage Watch");
    });

    it("Should start an auction", async function () {
      const { auction, addr1 } = await loadFixture(deployAuctionFixture);
      await auction.connect(addr1).createNewAuction("Vintage Watch");
      await expect(auction.connect(addr1).startAuction(0, 3600))
        .to.emit(auction, "AuctionStarted");
      
      const auctionInfo = await auction.getAuction(0);
      expect(auctionInfo.started).to.be.true;
    });

    it("Should not allow non-owner to start auction", async function () {
      const { auction, addr1, addr2 } = await loadFixture(deployAuctionFixture);
      await auction.connect(addr1).createNewAuction("Vintage Watch");
      await expect(auction.connect(addr2).startAuction(0, 3600))
        .to.be.revertedWith("Only auction owner can start the auction");
    });
  });

  describe("Bidding", function () {
    it("Should accept a bid", async function () {
      const { auction, addr1, addr2 } = await loadFixture(deployAuctionFixture);
      await auction.connect(addr1).createNewAuction("Vintage Watch");
      await auction.connect(addr1).startAuction(0, 3600);
      
      await expect(auction.connect(addr2).bid(0, { value: ethers.parseEther("1") }))
        .to.emit(auction, "HighestBidIncreased")
        .withArgs(0, addr2.address, ethers.parseEther("1"));
    });

    it("Should reject bids for non-started auctions", async function () {
      const { auction, addr1, addr2 } = await loadFixture(deployAuctionFixture);
      await auction.connect(addr1).createNewAuction("Vintage Watch");
      
      await expect(auction.connect(addr2).bid(0, { value: ethers.parseEther("1") }))
        .to.be.revertedWith("Auction not started yet");
    });
  });

  describe("Ending Auction", function () {
    it("Should end an auction", async function () {
      const { auction, addr1, addr2 } = await loadFixture(deployAuctionFixture);
      await auction.connect(addr1).createNewAuction("Vintage Watch");
      await auction.connect(addr1).startAuction(0, 1); // 1 second auction
      await auction.connect(addr2).bid(0, { value: ethers.parseEther("1") });
      
      // Wait for the auction to end
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine", []);

      await expect(auction.connect(addr1).endAuction(0))
        .to.emit(auction, "AuctionEnded")
        .withArgs(0, addr2.address, ethers.parseEther("1"));
    });

    it("Should not end an auction before its time", async function () {
      const { auction, addr1, addr2 } = await loadFixture(deployAuctionFixture);
      await auction.connect(addr1).createNewAuction("Vintage Watch");
      await auction.connect(addr1).startAuction(0, 3600);
      await auction.connect(addr2).bid(0, { value: ethers.parseEther("1") });

      await expect(auction.connect(addr1).endAuction(0))
        .to.be.revertedWith("Auction not yet ended.");
    });
  });
});