import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CandleAuction", (m) => {
  const candleAuction = m.contract("CandleAuction");

  return { candleAuction };
});