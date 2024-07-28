import { ethers } from 'ethers';
import CandleAuctionArtifact from './CandleAuction.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONTRACT_ABI = CandleAuctionArtifact.abi;

export class CandleAuctionContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(provider: ethers.providers.Web3Provider, signer: ethers.Signer) {
    if (typeof (window as any).ethereum !== 'undefined') {
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      this.signer = signer;
    } else {
      throw new Error('MetaMask is not installed. Please install MetaMask and try again.');
    }
  }
  async createAuction(randomEndTime: number) {
    const tx = await this.contract.connect(this.signer).createAuction(randomEndTime);
    return tx.wait
  }
  async placeBid(amount: string) {
    const tx = await this.contract.connect(this.signer).placeBid({ value: ethers.utils.parseEther(amount) });
    return tx.wait();
  }

  async getHighestBid(): Promise<string> {
    const highestBid = await this.contract.highestBid();
    return ethers.utils.formatEther(highestBid);
  }

  async getHighestBidder(): Promise<string> {
    return await this.contract.highestBidder();
  }

  async getAuctionEndTime(): Promise<number> {
    return (await this.contract.auctionEndTime()).toNumber();
  }

  async endAuction(auctionId: number) {
    const tx = await this.contract.connect(this.signer).endAuction(auctionId);
    return tx.wait();
  }

  async getAuctionDetails(auctionId: number): Promise<{
    highestBidder: string;
    highestBid: string;
    auctionEndTime: number;
    randomEndTime: number;
    ended: boolean;
  }> {
    const details = await this.contract.getAuctionDetails(auctionId);
    return {
      highestBidder: details[0],
      highestBid: ethers.utils.formatEther(details[1]),
      auctionEndTime: details[2].toNumber(),
      randomEndTime: details[3].toNumber(),
      ended: details[4],
    };
  }

  async getAuctionCount(): Promise<number> {
    return (await this.contract.getAuctionCount()).toNumber();
  }
  async getInstance(){
    return this.contract;
  }
}