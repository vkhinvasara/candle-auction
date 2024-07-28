<script lang="ts">
	import { onMount } from 'svelte';
	import { ethers } from 'ethers';
	import { CandleAuctionContract } from '$lib/ethereum';
  
	let provider: ethers.providers.Web3Provider;
	let signer: ethers.Signer;
	let auctionContract: CandleAuctionContract;
	let randomEndTime: number = 3600; 
	let message: string = '';
  
	onMount(async () => {
	  provider = new ethers.providers.Web3Provider(window.ethereum);
	  await provider.send("eth_requestAccounts", []);
	  signer = provider.getSigner();
  
	  auctionContract = new CandleAuctionContract(provider, signer);
	});
  
	async function createAuction() {
	  try {
		const tx = await auctionContract.createAuction(randomEndTime);
		message = 'Auction created successfully!';
		console.log('Auction created successfully:', tx);
	  } catch (error) {
		message = 'Error creating auction.';
		console.error('Error creating auction:', error);
	  }
	}
  </script>
  
  <main>
	<h1>Create Auction</h1>
	<form on:submit|preventDefault={createAuction}>
	  <label for="randomEndTime">Random End Time (seconds):</label>
	  <input type="number" id="randomEndTime" bind:value={randomEndTime} min="1" required />
	  <button type="submit">Create Auction</button>
	</form>
	{#if message}
	  <p>{message}</p>
	{/if}
  </main>