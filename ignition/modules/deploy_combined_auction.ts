import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CombinedCandleAuctionModule", (m) => {
  const combinedCandleAuction = m.contract("CombinedCandleAuction");

  return { combinedCandleAuction };
});