import { ethers } from 'ethers';
import { writable, get } from 'svelte/store';
import Web3Modal from 'web3modal';
import CombinedCandleAuction  from './CombinedCandleAuction.json'

export const account = writable(null);
export const provider = writable(null);
export const signer = writable(null);
export const contract = writable(null);

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const contractABI = CombinedCandleAuction.abi;

export async function connectWallet() {
  const web3Modal = new Web3Modal();
  const connection = await web3Modal.connect();
  const newProvider = new ethers.providers.Web3Provider(connection);
  const newSigner = newProvider.getSigner();
  const newAccount = await newSigner.getAddress();
  const newContract = new ethers.Contract(contractAddress, contractABI, newSigner);

  // @ts-ignore
  provider.set(newProvider);
  // @ts-ignore
  signer.set(newSigner);
  // @ts-ignore
  account.set(newAccount);
  // @ts-ignore
  contract.set(newContract);
}

// @ts-ignore
export async function createAuction(itemName, duration) {
  // @ts-ignore
  const contractInstance = get(contract);
  // @ts-ignore
  const tx = await contractInstance.createNewAuction(itemName);
  await tx.wait();
  console.log(tx);
  // @ts-ignore
  const auctionId = await contractInstance.auctionCount() - 1;
  // @ts-ignore
  const startTx = await contractInstance.startAuction(auctionId, duration);
  await startTx.wait();
  return auctionId;
}

// @ts-ignore
export async function placeBid(auctionId, amount) {
  // @ts-ignore
  const contractInstance = get(contract);
  // @ts-ignore
  const tx = await contractInstance.bid(auctionId, { value: ethers.utils.parseEther(amount) });
  await tx.wait();
}

// @ts-ignore
export async function getAuction(auctionId) {
  // @ts-ignore
  const contractInstance = get(contract);
  // @ts-ignore
  const auction = await contractInstance.getAuction(auctionId);
  return {
    id: auctionId,
    owner: auction.auctionOwner,
    highestBidder: auction.highestBidder,
    highestBid: ethers.utils.formatEther(auction.highestBid),
    endTime: new Date(auction.endTime.toNumber() * 1000),
    ended: auction.ended,
    started: auction.started,
    itemName: auction.itemName
  };
}