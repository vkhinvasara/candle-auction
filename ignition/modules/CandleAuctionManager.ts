import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';


const CandleAuctionManagerModule = buildModule("CandleAuctionManagerModule", (m) => {
	const candleAuctionManager = m.contract("CandleAuctionManager",[]);

	return { candleAuctionManager };
});

export default CandleAuctionManagerModule;

