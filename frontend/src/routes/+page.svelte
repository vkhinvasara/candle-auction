<script lang="ts">
	import { onMount } from "svelte";
	import { CandleAuctionContract } from "$lib/ethereum";
	import { ethers } from "ethers";
	import { Card, Button } from "flowbite-svelte";

	let contract: CandleAuctionContract;
	let auctions: Array<{ id: number; item: string }> = [];

	onMount(async () => {
		if (typeof (window as any).ethereum !== "undefined") {
			const provider = new ethers.providers.Web3Provider(
				(window as any).ethereum
			);
			await provider.send("eth_requestAccounts", []);
			const signer = provider.getSigner();
			contract = new CandleAuctionContract(provider, signer);
			await loadAuctions();
		}
	});

	async function loadAuctions() {
		if (contract) {
			try {
				console.log("Getting auction count...");
				const count = await contract.getAuctionCount();
				console.log(`Auction count: ${count}`);
				auctions = await Promise.all(
					Array(count)
						.fill(0)
						.map(async (_, i) => {
							try {
								console.log(`Fetching details for auction ${i}...`);
								const details = await contract.getAuctionDetails(i);
								console.log(`Details for auction ${i}:`, details);
								return { id: i, item: details.itemName };
							} catch (error) {
								console.error(
									`Error fetching details for auction ${i}:`,
									error
								);
								return { id: i, item: "Error fetching details" };
							}
						})
				);
			} catch (error) {
				console.error("Error loading auctions:", error);
				auctions = [];
			}
		}
	}
</script>

<h1 class="text-4xl font-bold text-center my-8">Candle Auction App</h1>

<nav class="flex justify-center mb-4">
	<Button class="text-lg">
		<a href="/create">Create New Auction</a>
	</Button>
</nav>

<h2 class="text-2xl font-semibold mb-4 text-center">Current Auctions</h2>
{#if auctions.length > 0}
	<ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{#each auctions as auction}
			<li>
				<Card>
					<a href="/auction/{auction.id}" class="block text-center p-4">
						Auction #{auction.id}: {auction.item}
					</a>
				</Card>
			</li>
		{/each}
	</ul>
{:else}
	<p class="text-center text-gray-500">No auctions available.</p>
{/if}
