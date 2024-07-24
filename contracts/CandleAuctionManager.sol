// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CandleAuction.sol";

contract CandleAuctionManager {
	address public owner;
	uint public auctionCount;
	mapping(uint => address) public auctions;

	event AuctionCreated(address auction, uint id);

	constructor() {
		owner = msg.sender;
	}

	function createAuction(uint _biddingTime) public onlyOwner{
		CandleAuction newAuction = new CandleAuction(_biddingTime);
		auctions[auctionCount] = address(newAuction);
		auctionCount += 1;
		emit AuctionCreated(address(newAuction), auctionCount - 1);
	}
	function getAuction(uint _id) public view returns (address) {
		require(_id < auctionCount, "Auction does not exist");
		return auctions[_id];
	}
	modifier onlyOwner() {
		require(msg.sender == owner, "Only owner can call this function.");
		_;
	}
}  