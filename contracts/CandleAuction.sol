// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CandleAuction {
    address public highestBidder;
    uint public highestBid;
    uint public auctionEndTime;
    uint public randomEndTime;
    bool public ended;
    address public owner;

    mapping(address => uint) public pendingReturns;

    event HighestBidIncreased(address bidder, uint amount);
    event AuctionEnded(address winner, uint amount);

    constructor(uint _biddingTime) {
        owner = msg.sender;
        auctionEndTime = block.timestamp + _biddingTime;
        randomEndTime =
            auctionEndTime -
            (uint(
                keccak256(abi.encodePacked(block.timestamp, block.difficulty))
            ) % _biddingTime);
    }

    function placeBid() public payable {
        require(block.timestamp <= auctionEndTime, "Auction already ended.");
        require(block.timestamp <= randomEndTime, "Auction ended randomly.");
        require(msg.value > highestBid, "There already is a higher bid.");

        if (highestBid != 0) {
            pendingReturns[highestBidder] += highestBid;
        }

        highestBidder = msg.sender;
        highestBid = msg.value;
        emit HighestBidIncreased(msg.sender, msg.value);
    }

    function withdraw() public returns (bool) {
        uint amount = pendingReturns[msg.sender];
        if (amount > 0) {
            pendingReturns[msg.sender] = 0;

            if (!payable(msg.sender).send(amount)) {
                pendingReturns[msg.sender] = amount;
                return false;
            }
        }
        return true;
    }

    function endAuction() public {
        require(
            block.timestamp >= auctionEndTime ||
                block.timestamp >= randomEndTime,
            "Auction not yet ended."
        );
        require(!ended, "endAuction has already been called.");

        ended = true;
        emit AuctionEnded(highestBidder, highestBid);

        payable(owner).transfer(highestBid);
    }
}
