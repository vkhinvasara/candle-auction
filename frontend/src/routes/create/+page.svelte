<script>
// @ts-nocheck

	import { createAuction } from '$lib/ethereum';
  
	let itemName = '';
	let duration = 3600; // Default to 1 hour
  
	async function handleSubmit() {
	  try {
		const auctionId = await createAuction(itemName, duration);
		alert(`Auction created with ID: ${auctionId}`);
		itemName = '';
		duration = 3600;
	  } catch (error) {
		alert(`Error creating auction: ${error.message}`);
	  }
	}
  </script>
  
  <h1>Create New Auction</h1>
  
  <form on:submit|preventDefault={handleSubmit}>
	<div>
	  <label for="itemName">Item Name:</label>
	  <input id="itemName" bind:value={itemName} required>
	</div>
	<div>
	  <label for="duration">Duration (in seconds):</label>
	  <input id="duration" type="number" bind:value={duration} min="60" required>
	</div>
	<button type="submit">Create Auction</button>
  </form>