<script>
// @ts-nocheck

	import { page } from "$app/stores";
	import { onMount } from "svelte";
	import { getAuction, placeBid } from "$lib/ethereum";

	let auction = null;
	let bidAmount = "";

	onMount(async () => {
		const auctionId = $page.params.id;
		auction = await getAuction(auctionId);
	});

	async function handleBid() {
		try {
			await placeBid(auction.id, bidAmount.toString());
			alert("Bid placed successfully!");
			auction = await getAuction(auction.id);
			bidAmount = "";
		} catch (error) {
			alert(`Error placing bid: ${error.message}`);
		}
	}
</script>

{#if auction}
	<h1>{auction.itemName}</h1>
	<p>Highest Bid: {auction.highestBid} ETH</p>
	<p>Ends at: {auction.endTime.toLocaleString()}</p>

	{#if !auction.ended}
		<form on:submit|preventDefault={handleBid}>
			<input
				type="number"
				step="0.01"
				bind:value={bidAmount}
				placeholder="Bid amount in ETH"
			/>
			<button type="submit">Place Bid</button>
		</form>
	{:else}
		<p>This auction has ended.</p>
	{/if}
{:else}
	<p>Loading auction...</p>
{/if}
