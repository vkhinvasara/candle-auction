<script lang="ts">
  import { CandleAuctionContract } from '$lib/ethereum';
  import { ethers } from 'ethers';
  import { onMount } from 'svelte';
  import { Button } from 'flowbite-svelte';

  let contract: CandleAuctionContract;
  let auctionItem = '';
  let biddingTime = '';

  onMount(async () => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      contract = new CandleAuctionContract(provider, signer);
    }
  });

  async function handleSubmit() {
    if (contract) {
      try {
        await contract.createAuction(parseInt(biddingTime), auctionItem);
        alert('Auction created successfully!');
        auctionItem = '';
        biddingTime = '';
      } catch (error) {
        console.error('Error creating auction:', error);
        alert('Failed to create auction. See console for details.');
      }
    }
  }
</script>

<h1 class="text-4xl font-bold text-center my-8">Create New Auction</h1>

<form class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md" on:submit|preventDefault={handleSubmit}>
  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2" for="auctionItem">Auction Item:</label>
    <input id="auctionItem" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" bind:value={auctionItem} required>
  </div>

  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2" for="biddingTime">Bidding Time (in seconds):</label>
    <input id="biddingTime" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" bind:value={biddingTime} required>
  </div>

  <div class="flex items-center justify-between">
    <Button type="submit" class="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
      Create Auction
    </Button>
  </div>
</form>

<div class="text-center mt-4">
  <a href="/" class="text-blue-500 hover:underline">Back to Home</a>
</div>
