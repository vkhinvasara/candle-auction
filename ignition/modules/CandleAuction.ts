import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CandleAuctionModule = buildModule("CandleAuctionModule", (m) => {
	const candleAuction = m.contract("CandleAuction", [60]);
	return { candleAuction };
});

export default CandleAuctionModule;