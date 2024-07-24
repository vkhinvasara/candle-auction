import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("CandleAuction", function () {
  async function deployCandleAuctionFixture() {
	const [owner, otherAccount] = await ethers.getSigners();

	const CandleAuction = await ethers.getContractFactory("CandleAuction");
	const candleAuction = await CandleAuction.deploy(50);

	return { candleAuction, owner, otherAccount };
  }

describe("Deployment", function () {
	it("Should set the right owner", async function () {
		const { candleAuction, owner } = await loadFixture(deployCandleAuctionFixture);

		expect(await candleAuction.owner()).to.equal(owner.address);
	});
});
describe("Bidding", function () {
	it("Should allow a bid", async function () {
		const { candleAuction, owner, otherAccount } = await loadFixture(deployCandleAuctionFixture);

		await candleAuction.connect(otherAccount).bid({ value: 100 });

		expect(await candleAuction.highestBidder()).to.equal(otherAccount.address);
		expect(await candleAuction.highestBid()).to.equal(100);
	});
	it("Should allow a higher bid", async function () {	
		const { candleAuction, owner, otherAccount } = await loadFixture(deployCandleAuctionFixture);
		await candleAuction.connect(otherAccount).bid({ value: 100 });
		await candleAuction.connect(owner).bid({ value: 200 });
		expect(await candleAuction.highestBidder()).to.equal(owner.address);
		expect(await candleAuction.highestBid()).to.equal(200);
	});
	it("Should not allow a bid lower than the highest bid", async function () {
		const { candleAuction, owner, otherAccount } = await loadFixture(deployCandleAuctionFixture);
		await candleAuction.connect(otherAccount).bid({ value: 100 });
		await expect(candleAuction.connect(owner).bid({ value: 50 })).to.be.revertedWith("There already is a higher bid.");
	});
});
});
