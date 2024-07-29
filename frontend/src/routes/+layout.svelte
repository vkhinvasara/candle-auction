<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { ethers } from "ethers";
	import { Navbar, NavUl, NavLi, Button } from 'flowbite-svelte';
	let address: string = "";
	let balance: string = "";

	onMount(async () => {
		if (typeof window.ethereum !== "undefined") {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = await provider.getSigner();
			address = await signer.getAddress();
			balance = ethers.utils.formatEther(await provider.getBalance(address));
		}
	});

	async function connectWallet() {
		if (typeof window.ethereum !== "undefined") {
			await window.ethereum.request({ method: "eth_requestAccounts" });
			window.location.reload();
		}
	}
</script>

<Navbar class="p-4 flex justify-between items-center">
	<NavUl class="flex space-x-4">
		<NavLi href="/">Home</NavLi>
		<NavLi href="/create">Create Auction</NavLi>
	</NavUl>
	<div class="wallet-info flex items-center space-x-4">
		{#if address}
			<span class="text-md">Address: {address.slice(0, 8)}..</span>
			<span class="text-md">Balance: {balance.slice(0, 8)} ETH</span>
		{:else}
			<Button on:click={connectWallet} class="font-bold py-2 px-4 rounded">Connect Wallet</Button>
		{/if}
	</div>
</Navbar>
<slot></slot>
