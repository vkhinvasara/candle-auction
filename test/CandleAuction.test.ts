import {ethers, waffle} from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';

async function deployCandleAuctionFixture() {
	const [owner, otherAccount] = await ethers.getSigners();
	const CandleAuction = await ethers.getContractFactory("CandleAuction");
	const candleAuction = await CandleAuction.deploy();
  	return { candleAuction, owner, otherAccount };
}

it("Should set the right owner", async function () {
	const { candleAuction, owner } = await loadFixture(deployCandleAuctionFixture);
	expect(await candleAuction.owner()).to.equal(owner.address);
});

