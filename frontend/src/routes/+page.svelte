<script lang="ts">
	import { onMount } from "svelte";
	import { ethers } from "ethers";
	import { CandleAuctionContract } from "$lib/ethereum";

	let auctions: {
		id: number;
		highestBidder: string;
		highestBid: string;
		auctionEndTime: number;
		randomEndTime: number;
		ended: boolean;
	}[] = [];
	let error = "";

	onMount(async () => {
		try {
			if (typeof (window as any).ethereum !== "undefined") {
				const provider = new ethers.providers.Web3Provider((window as any).ethereum);
				const signer = provider.getSigner();
				const contract = new CandleAuctionContract(provider, signer);
				const auctionCount = await contract.getAuctionCount();
				console.log(auctionCount);
				for (let i = 0; i < auctionCount; i++) {
					const auctionDetails: {
						highestBidder: string;
						highestBid: string;
						auctionEndTime: number;
						randomEndTime: number;
						ended: boolean;
					} = await contract.getAuctionDetails(i);
					console.log(auctionDetails);
					if (!auctionDetails.ended) {
						const updatedAuctions = [...auctions, { id: i, ...auctionDetails }];
						auctions = updatedAuctions;
					}
				}
			} else {
				error =
					"MetaMask is not installed. Please install MetaMask and try again.";
			}
		} catch (err) {
			error = `Error fetching auctions: ${(err as Error).message}`;
		}
	});
</script>

<main>
	<h1>Ongoing Auctions</h1>
	{#if error}
		<p class="error">{error}</p>
	{/if}
	{#if auctions.length > 0}
		<ul>
			{#each auctions as auction}
				<li>
					<h2>Auction {auction.id}</h2>
					<p>Highest Bidder: {auction.highestBidder}</p>
					<p>Highest Bid: {auction.highestBid} ETH</p>
					<p>
						Auction End Time: {new Date(
							auction.auctionEndTime * 1000
						).toLocaleString()}
					</p>
					<p>
						Random End Time: {new Date(
							auction.randomEndTime * 1000
						).toLocaleString()}
					</p>
				</li>
			{/each}
		</ul>
	{:else}
		<p>No ongoing auctions at the moment.</p>
	{/if}
</main>

<style>
	main {
		padding: 1rem;
	}
	.error {
		color: red;
	}
	ul {
		list-style-type: none;
		padding: 0;
	}
	li {
		border: 1px solid #ccc;
		padding: 1rem;
		margin: 1rem 0;
	}
</style>
