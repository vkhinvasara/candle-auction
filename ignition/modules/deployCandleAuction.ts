import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const deployCandleAuction = buildModule("CandleAuction", (m) => {
  const biddingTime = 3600; // 1 hour in seconds
  const candleAuction = m.contract("CandleAuction", [biddingTime]);

  return { candleAuction: candleAuction };
});

export default deployCandleAuction;