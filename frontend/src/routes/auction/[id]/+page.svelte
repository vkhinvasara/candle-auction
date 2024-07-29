<script lang="ts">
	import { CandleAuctionContract } from "$lib/ethereum";
	import { ethers } from "ethers";
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { Label, Input, Button } from "flowbite-svelte";

	let contract: CandleAuctionContract;
	let auctionDetails: any = null;
	let bidAmount = "";

	const auctionId = $page.params.id;

	onMount(async () => {
		if (typeof (window as any).ethereum !== "undefined") {
			const provider = new ethers.providers.Web3Provider(
				(window as any).ethereum
			);
			await provider.send("eth_requestAccounts", []);
			const signer = provider.getSigner();
			contract = new CandleAuctionContract(provider, signer);
			loadAuctionDetails();
		}
	});

	async function loadAuctionDetails() {
		if (contract) {
			auctionDetails = await contract.getAuctionDetails(parseInt(auctionId));
		}
	}

	async function placeBid(event: SubmitEvent, auctionId: number, bidAmount: number) {
		if (contract) {
			try {
				// First, check if the auction is still active
				const auctionDetails = await contract.getAuctionDetails(auctionId);
				const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

				if (
					currentTime > auctionDetails.auctionEndTime ||
					currentTime > auctionDetails.randomEndTime
				) {
					alert("This auction has ended and is no longer accepting bids.");
					return;
				}

				// If the auction is still active, proceed with placing the bid
				console.log(bidAmount.toString());
				const tx = await contract.placeBid(
					auctionId,
					bidAmount.toString()
				);
				alert("Bid placed successfully!");
				loadAuctionDetails();
				// Refresh auction details or perform any other necessary updates
			} catch (error) {
				console.error("Error placing bid:", error);
				if ((error as Error).message.includes("Auction ended randomly")) {
					alert(
						"This auction has ended randomly and is no longer accepting bids."
					);
				} else {
					alert("Failed to place bid. Please try again.");
				}
			}
		}
	}

	async function endAuction() {
		if (contract) {
			try {
				await contract.endAuction(parseInt(auctionId));
				alert("Auction ended successfully!");
				loadAuctionDetails();
			} catch (error) {
				console.error("Error ending auction:", error);
				alert("Failed to end auction. See console for details.");
			}
		}
	}
</script>


<div class="container mx-auto p-4 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">Auction #{auctionId}</h1>

    {#if auctionDetails}
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <h2 class="text-2xl font-semibold mb-4">Item: {auctionDetails.itemName}</h2>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <p class="font-bold">Highest Bidder:</p>
                    <p class="truncate">{auctionDetails.highestBidder}</p>
                </div>
                <div>
                    <p class="font-bold">Highest Bid:</p>
                    <p>{auctionDetails.highestBid} ETH</p>
                </div>
                <div>
                    <p class="font-bold">Auction End Time:</p>
                    <p>{new Date(auctionDetails.auctionEndTime * 1000).toLocaleString()}</p>
                </div>
                <div>
                    <p class="font-bold">Random End Time:</p>
                    <p>{new Date(auctionDetails.randomEndTime * 1000).toLocaleString()}</p>
                </div>
                <div>
                    <p class="font-bold">Ended:</p>
                    <p class:text-red-500={auctionDetails.ended} class:text-green-500={!auctionDetails.ended}>
                        {auctionDetails.ended ? "Yes" : "No"}
                    </p>
                </div>
            </div>

            {#if !auctionDetails.ended}
                <div class="mb-6">
                    <h2 class="text-xl font-semibold mb-4">Place a Bid</h2>
                    <form on:submit|preventDefault={(event) => placeBid(event, parseInt(auctionId), parseFloat(bidAmount))} class="space-y-4">
                        <div>
                            <Label for="bidAmount" class="block mb-2">Bid Amount (ETH):</Label>
                            <Input id="bidAmount" type="number" step="0.01" bind:value={bidAmount} required class="w-full" />
                        </div>
                        <Button type="submit" class="w-full">Place Bid</Button>
                    </form>
                </div>
                <Button on:click={endAuction} color="red" class="w-full">End Auction</Button>
            {/if}
        </div>
    {:else}
        <p class="text-center text-gray-500">Loading auction details...</p>
    {/if}

    <a href="/" class="block text-center text-blue-500 hover:underline mt-4">Back to Home</a>
</div>

