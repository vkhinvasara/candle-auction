import { ethers } from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";


describe("CandleAuctionManager", function(){
	async function deployCandleAuctionManagerFixture(){
		const [owner, otherAccount] = await ethers.getSigners();
		const CandleAuctionManager = await ethers.getContractFactory("CandleAuctionManager");
		const candleAuctionManager = await CandleAuctionManager.deploy();
		return { candleAuctionManager, owner, otherAccount };
	}

	describe("Deployment", function(){
		it("Should set the right owner", async function(){
			const { candleAuctionManager, owner } = await loadFixture(deployCandleAuctionManagerFixture);
			expect(await candleAuctionManager.owner()).to.equal(owner.address);
		});
	});

	describe("Create Auction", function(){
		it("Should allow the owner to create an auction", async function(){
			const { candleAuctionManager, owner } = await loadFixture(deployCandleAuctionManagerFixture);
			await candleAuctionManager.createAuction(50);
			expect(await candleAuctionManager.auctionCount()).to.equal(1);
		});
		it("Should not allow a non-owner to create an auction", async function(){
			const { candleAuctionManager, owner, otherAccount } = await loadFixture(deployCandleAuctionManagerFixture);
			await expect(candleAuctionManager.connect(otherAccount).createAuction(50)).to.be.revertedWith("Only owner can call this function.");
		});
	});

	describe("Get Auction", function(){
		it("Should return the auction address", async function(){
			const { candleAuctionManager, owner } = await loadFixture(deployCandleAuctionManagerFixture);
			await candleAuctionManager.createAuction(50);
			const auctionAddress = await candleAuctionManager.getAuction(0);
			expect(auctionAddress).to.not.equal(ethers.ZeroAddress);
		});
		it("Should not return the auction address if the auction does not exist", async function(){
			const { candleAuctionManager, owner } = await loadFixture(deployCandleAuctionManagerFixture);
			await expect(candleAuctionManager.getAuction(0)).to.be.revertedWith("Auction does not exist");
		});
	});

	describe("Get Auction Count", function(){
		it("Should return the number of auctions", async function(){
			const { candleAuctionManager, owner } = await loadFixture(deployCandleAuctionManagerFixture);
			await candleAuctionManager.createAuction(50);
			expect(await candleAuctionManager.auctionCount()).to.equal(1);
		});
	});

})