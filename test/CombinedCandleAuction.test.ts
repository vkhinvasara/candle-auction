import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory, Signer } from "ethers";
import { CandleAuction } from "../typechain";

describe("CandleAuction", function () {
  let CandleAuction: ContractFactory;
  let candleAuction: CandleAuction;
  let owner: Signer;
  let addr1: Signer;
  let addr2: Signer;
  let addrs: Signer[];

  beforeEach(async function () {
    CandleAuction = await ethers.getContractFactory("CandleAuction");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    candleAuction = await (CandleAuction.deploy(60) as Promise<Contract>);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await candleAuction.owner()).to.equal(await owner.getAddress());
    });

    it("Should set the auction end time", async function () {
      const auctionEndTime = await candleAuction.auctionEndTime();
      expect(auctionEndTime).to.be.above(0);
    });

    it("Should set the random end time", async function () {
      const randomEndTime = await candleAuction.randomEndTime();
      expect(randomEndTime).to.be.above(0);
    });
  });

  describe("Bidding", function () {
    it("Should allow placing a bid", async function () {
      await candleAuction.connect(addr1).placeBid({ value: ethers.parseEther("1") });
      expect(await candleAuction.highestBid()).to.equal(ethers.parseEther("1"));
      expect(await candleAuction.highestBidder()).to.equal(await addr1.getAddress());
    });

    it("Should not allow placing a bid after auction end time", async function () {
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);
      await expect(candleAuction.connect(addr1).placeBid({ value: ethers.parseEther("1") }))
        .to.be.revertedWith("Auction already ended.");
    });

    it("Should not allow placing a bid after random end time", async function () {
      const randomEndTime = await candleAuction.randomEndTime();
      const latestBlock = await ethers.provider.getBlock('latest');
      const currentTime = latestBlock ? BigInt(latestBlock.timestamp) : BigInt(0);
      const timeToIncrease = randomEndTime - currentTime + BigInt(1);
      await ethers.provider.send("evm_increaseTime", [Number(timeToIncrease)]);
      await ethers.provider.send("evm_mine", []);
      await expect(candleAuction.connect(addr1).placeBid({ value: ethers.parseEther("1") }))
        .to.be.revertedWith("Auction ended randomly.");
    });

    it("Should refund previous highest bidder when outbid", async function () {
      await candleAuction.connect(addr1).placeBid({ value: ethers.parseEther("1") });
      await candleAuction.connect(addr2).placeBid({ value: ethers.parseEther("2") });

      expect(await candleAuction.pendingReturns(await addr1.getAddress())).to.equal(ethers.parseEther("1"));
      expect(await candleAuction.highestBid()).to.equal(ethers.parseEther("2"));
      expect(await candleAuction.highestBidder()).to.equal(await addr2.getAddress());
    });
  });

  describe("Auction End", function () {
    it("Should allow ending the auction after end time", async function () {
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);
      await candleAuction.endAuction();
      expect(await candleAuction.ended()).to.equal(true);
    });

    it("Should allow ending the auction after random end time", async function () {
      const randomEndTime = await candleAuction.randomEndTime();
      const latestBlock = await ethers.provider.getBlock('latest');
      const currentTime = latestBlock ? BigInt(latestBlock.timestamp) : BigInt(0);
      const timeToIncrease = randomEndTime - currentTime + BigInt(1);
      await ethers.provider.send("evm_increaseTime", [Number(timeToIncrease)]);
      await ethers.provider.send("evm_mine", []);
      await candleAuction.endAuction();
      expect(await candleAuction.ended()).to.equal(true);
    });

    it("Should transfer the highest bid to the owner when auction ends", async function () {
      await candleAuction.connect(addr1).placeBid({ value: ethers.parseEther("1") });
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine", []);
      await candleAuction.endAuction();

      const ownerBalance = await ethers.provider.getBalance(await owner.getAddress());
      expect(ownerBalance).to.be.above(ethers.parseEther("10000"));
    });
  });
});