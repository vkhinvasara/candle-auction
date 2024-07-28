# Running the Project

Follow these steps to set up and run the project:

1. **Navigate to the project root and install dependencies:**
    ```sh
    cd candle-auction
    npm install
    ```

2. **Navigate to the frontend directory and install dependencies:**
    ```sh
    cd frontend
    npm install
    ```

3. **Start the Hardhat node:**
    ```sh
    cd ..
    npx hardhat node
    ```

4. **Deploy the smart contract:**
    ```sh
    npx hardhat ignition deploy ignition/modules/deploy_combined_auction.ts --network localhost
    ```

5. **Run the frontend development server in a separate terminal:**
    ```sh
    cd frontend
    npm run dev
    ```

You should now have the Hardhat node running and the frontend development server up and running.


