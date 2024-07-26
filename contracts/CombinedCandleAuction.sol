// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";

contract CombinedCandleAuction {
    address public owner;
    uint public auctionCount;
    mapping(uint => Auction) public auctions;

    struct Auction {
        address auctionOwner;
        address highestBidder;
        uint highestBid;
        uint endTime;
        bool ended;
        bool started;
        string itemName;
    }

    event AuctionCreated(uint id, address auctionOwner, string itemName);
    event AuctionStarted(uint id, uint endTime);
    event HighestBidIncreased(uint auctionId, address bidder, uint amount);
    event AuctionEnded(uint auctionId, address winner, uint amount);

    constructor() {
        owner = msg.sender;
    }

    function createNewAuction(string memory _itemName) public {
        console.log("Creating auction for item:", _itemName);
        console.log("Sender:", msg.sender);
        auctions[auctionCount] = Auction(msg.sender, address(0), 0, 0, false, false, _itemName);
        emit AuctionCreated(auctionCount, msg.sender, _itemName);
        auctionCount += 1;
    }

    function startAuction(uint _auctionId, uint _biddingTime) public {
        Auction storage auction = auctions[_auctionId];
        require(msg.sender == auction.auctionOwner, "Only auction owner can start the auction");
        require(!auction.started, "Auction already started");
        
        auction.started = true;
        auction.endTime = block.timestamp + _biddingTime;
        emit AuctionStarted(_auctionId, auction.endTime);
    }

    function getAuction(uint _id) public view returns (Auction memory) {
        require(_id < auctionCount, "Auction does not exist");
        return auctions[_id];
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function bid(uint _auctionId) public payable {
        Auction storage auction = auctions[_auctionId];
        require(auction.started, "Auction not started yet");
        require(block.timestamp <= auction.endTime, "Auction already ended.");
        require(msg.value > auction.highestBid, "There already is a higher bid.");

        if (auction.highestBid != 0) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
        emit HighestBidIncreased(_auctionId, msg.sender, msg.value);
    }

    function endAuction(uint _auctionId) public {
        Auction storage auction = auctions[_auctionId];
        require(auction.started, "Auction not started yet");
        require(block.timestamp >= auction.endTime, "Auction not yet ended.");
        require(!auction.ended, "endAuction has already been called.");

        auction.ended = true;
        emit AuctionEnded(_auctionId, auction.highestBidder, auction.highestBid);

        payable(auction.auctionOwner).transfer(auction.highestBid);
    }
}