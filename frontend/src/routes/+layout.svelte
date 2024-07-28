<script lang="ts">
	import { onMount } from 'svelte';
	import { ethers } from 'ethers';
	let address: string = '';
	let balance: string = '';
  
	onMount(async () => {
	  if (typeof window.ethereum !== 'undefined') {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = await provider.getSigner();
		address = await signer.getAddress();
		balance = ethers.utils.formatEther(await provider.getBalance(address));
	  }
	});
  
	async function connectWallet() {
	  if (typeof window.ethereum !== 'undefined') {
		await window.ethereum.request({ method: 'eth_requestAccounts' });
		window.location.reload();
	  }
	}
  </script>
  
  <nav>
	<a href="/">Home</a>
	<a href="/create">Create Auction</a>
	{#if address}
	  <span>Address: {address}</span>
	  <span>Balance: {balance} ETH</span>
	{:else}
	  <button on:click={connectWallet}>Connect Wallet</button>
	{/if}
  </nav>
  
  <slot />
  
  <style>
	nav {
	  display: flex;
	  justify-content: space-between;
	  padding: 1em;
	  background-color: #f0f0f0;
	}
	
	a {
	  color: #333;
	  text-decoration: none;
	  margin-right: 1em;
	}
	
	button {
	  background-color: #4CAF50;
	  border: none;
	  color: white;
	  padding: 0.5em 1em;
	  text-align: center;
	  text-decoration: none;
	  display: inline-block;
	  font-size: 16px;
	  margin: 4px 2px;
	  cursor: pointer;
	}
  </style>