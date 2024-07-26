import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";

const config: HardhatUserConfig = {
	solidity: "0.8.24",
	networks: {
		hardhat: {
			chainId: 31337,
		},
		localhost: {
			url: "http://127.0.0.1:8545",
		},
	},
};

export default config;
