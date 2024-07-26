<script>
// @ts-nocheck

	import { onMount } from 'svelte';
	import { account, connectWallet } from '$lib/ethereum';
  
	onMount(() => {
	  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
		connectWallet();
	  }
	});
  </script>
  
  <nav>
	<a href="/">Home</a>
	<a href="/create">Create Auction</a>
	{#if $account}
	  <span>Connected: {$account.slice(0, 6)}...{$account.slice(-4)}</span>
	{:else}
	  <button on:click={connectWallet}>Connect Wallet</button>
	{/if}
  </nav>
  
  <main>
	<slot />
  </main>
  
  <style>
	nav {
	  padding: 1rem;
	  background-color: #f0f0f0;
	}
	nav a, nav button, nav span {
	  margin-right: 1rem;
	}
  </style>