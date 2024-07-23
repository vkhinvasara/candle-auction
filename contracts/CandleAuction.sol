// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CandleAuction {
	address public highestBidder;
	uint public highestBid;
	uint public endTime;
	bool public ended;

	event HighestBidIncreased(address bidder, uint amount);
	event AuctionEnded(address winner, uint amount);

	constructor(uint _biddingTime) {
		endTime = block.timestamp + _biddingTime;
	}

	function bid() public payable {
		require(block.timestamp <= endTime, "Auction already ended.");
		require(msg.value > highestBid, "There already is a higher bid.");

		if (highestBid != 0) {
			payable(highestBidder).transfer(highestBid);
		}

		highestBidder = msg.sender;
		highestBid = msg.value;
		emit HighestBidIncreased(msg.sender, msg.value);
	}

	function endAuction() public {
		require(block.timestamp >= endTime, "Auction not yet ended.");
		require(!ended, "endAuction has already been called.");

		ended = true;
		emit AuctionEnded(highestBidder, highestBid);

		payable(highestBidder).transfer(highestBid);
	}
}