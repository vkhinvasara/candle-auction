<script>
	// @ts-nocheck

	import { onMount } from "svelte";
	import { contract, getAuction } from "$lib/ethereum";

	let auctions = [];

	onMount(async () => {
		if ($contract) {
			const auctionCount = await $contract.auctionCount();
			auctions = await Promise.all(
				Array.from({ length: auctionCount }, (_, i) => getAuction(i))
			);
		}
	});
</script>

<h1>Active Auctions</h1>
<div class="auction-list">
{#each auctions as auction}
	<div class = "auction-card">
		<h2>{auction.itemName}</h2>
		<p>Highest Bid: {auction.highestBid} ETH</p>
		<p>Ends at: {auction.endTime.toLocaleString()}</p>
		<a href="/auction/{auction.id}">View Auction</a>
	</div>
{/each}
</div>
<style>
	h1 {
		text-align: center;
		margin-top: 20px;
		color: #333;
	}

	.auction-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 20px;
		padding: 20px;
	}

	.auction-card {
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		padding: 20px;
		width: 300px;
		text-align: center;
	}

	.auction-card h2 {
		font-size: 1.5em;
		margin-bottom: 10px;
		color: #0070f3;
	}

	.auction-card p {
		margin: 5px 0;
		color: #555;
	}

	.auction-card a {
		display: inline-block;
		margin-top: 10px;
		padding: 10px 20px;
		background: #0070f3;
		color: #fff;
		text-decoration: none;
		border-radius: 4px;
		transition: background 0.3s;
	}

	.auction-card a:hover {
		background: #005bb5;
	}
</style>
