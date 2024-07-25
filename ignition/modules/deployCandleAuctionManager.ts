import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const deployCandleAuctionManager = buildModule("CandleAuctionManager", (m) => {
  const candleAuctionManager = m.contract("CandleAuctionManager");

  return { candleAuctionManager : candleAuctionManager };
});

export default deployCandleAuctionManager;