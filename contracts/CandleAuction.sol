// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CandleAuction {
    struct Auction {
        string auctionItem;
        address highestBidder;
        uint highestBid;
        uint auctionEndTime;
        uint randomEndTime;
        bool ended;
    }

    address public owner;
    Auction[] public auctions;
    mapping(address => uint) public pendingReturns;

    event HighestBidIncreased(uint auctionId, address bidder, uint amount);
    event AuctionEnded(uint auctionId, address winner, uint amount);

    constructor() {
        owner = msg.sender;
    }

    function createAuction(uint _biddingTime, string memory _auctionItem) public {
        require(msg.sender == owner, "Only the owner can create auctions.");
        uint auctionEndTime = block.timestamp + _biddingTime;
        uint randomEndTime = auctionEndTime - (uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % _biddingTime);
        auctions.push(Auction({
            auctionItem: _auctionItem,
            highestBidder: address(0),
            highestBid: 0,
            auctionEndTime: auctionEndTime,
            randomEndTime: randomEndTime,
            ended: false
        }));
    }

    function placeBid(uint auctionId) public payable {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp <= auction.auctionEndTime, "Auction already ended.");
        require(block.timestamp <= auction.randomEndTime, "Auction ended randomly.");
        require(msg.value > auction.highestBid, "There already is a higher bid.");

        if (auction.highestBid != 0) {
            pendingReturns[auction.highestBidder] += auction.highestBid;
        }

        auction.highestBidder = msg.sender;
        auction.highestBid = msg.value;
        emit HighestBidIncreased(auctionId, msg.sender, msg.value);
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

    function endAuction(uint auctionId) public {
        Auction storage auction = auctions[auctionId];
        require(block.timestamp >= auction.auctionEndTime || block.timestamp >= auction.randomEndTime, "Auction not yet ended.");
        require(!auction.ended, "endAuction has already been called.");

        auction.ended = true;
        emit AuctionEnded(auctionId, auction.highestBidder, auction.highestBid);

        payable(owner).transfer(auction.highestBid);
    }

    function getAuctionDetails(uint auctionId) public view returns (
        string memory _auctionItem,
        address _highestBidder,
        uint _highestBid,
        uint _auctionEndTime,
        uint _randomEndTime,
        bool _ended
    ) {
        Auction storage auction = auctions[auctionId];
        return (
            auction.auctionItem,
            auction.highestBidder,
            auction.highestBid,
            auction.auctionEndTime,
            auction.randomEndTime,
            auction.ended
        );
    }

    function getAuctionCount() public view returns (uint) {
        return auctions.length;
    }
}