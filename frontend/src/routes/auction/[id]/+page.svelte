<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { CandleAuctionContract } from '$lib/ethereum';
  
	let auction: any = null;
	let bidAmount: string = '';
  
	$: auctionId = $page.params.id;
  
	onMount(async () => {
	  const contract = await CandleAuctionContract.getInstance();
	  auction = await contract.getAuction(auctionId);
	});
  
	async function placeBid() {
	  if (bidAmount) {
		const contract = await CandleAuctionContract.getInstance();
		await contract.placeBid(auctionId, bidAmount);
		auction = await contract.getAuction(auctionId);
		bidAmount = '';
	  }
	}
  </script>
  
  <main>
	<h1>Auction {auctionId}</h1>
	
	{#if auction}
	  <p>Highest Bid: {auction.highestBid} ETH</p>
	  <p>Highest Bidder: {auction.highestBidder}</p>
	  <p>Ends at: {new Date(auction.endTime * 1000).toLocaleString()}</p>
	  
	  <input type="number" bind:value={bidAmount} placeholder="Bid amount in ETH" />
	  <button on:click={placeBid}>Place Bid</button>
	{:else}
	  <p>Loading auction details...</p>
	{/if}
  </main>
  
  <style>
	main {
	  padding: 1em;
	}
	
	input, button {
	  margin-top: 1em;
	}
  </style>