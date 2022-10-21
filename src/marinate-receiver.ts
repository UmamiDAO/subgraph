import { BigDecimal } from "@graphprotocol/graph-ts";
import { cmUMAMI } from "../generated/cmUMAMI/cmUMAMI";
import { RewardAdded as RewardAddedEvent } from "../generated/marinateReceiver/marinateReceiver";
import { mUMAMI } from "../generated/mUMAMI/mUMAMI";
import { sUMAMI } from "../generated/sUMAMI/sUMAMI";
import { EthDistribution, SupplyBreakdown } from "../generated/schema";
import { UMAMI } from "../generated/UMAMI/UMAMI";
import {
  CM_UMAMI_ADDRESS,
  FORVER_LOCKED_HOLDERS,
  M_UMAMI_ADDRESS,
  S_UMAMI_ADDRESS,
  UMAMI_ADDRESS,
} from "./addresses";

export function handleRewardAdded(event: RewardAddedEvent): void {
  let ethDistribution = new EthDistribution(event.transaction.hash.toHex());
  let supplyBreakdown = new SupplyBreakdown(event.transaction.hash.toHex());
  supplyBreakdown.event = "reward-added";
  const UMAMIContract = UMAMI.bind(UMAMI_ADDRESS);
  const sUMAMIContract = sUMAMI.bind(S_UMAMI_ADDRESS);
  const mUMAMIContract = mUMAMI.bind(M_UMAMI_ADDRESS);
  const cmUMAMIContract = cmUMAMI.bind(CM_UMAMI_ADDRESS);

  const totalSupplyCallResult = UMAMIContract.try_totalSupply();
  const umamiDecimalsCallResult = UMAMIContract.try_decimals();
  const marinatingCallResult = mUMAMIContract.try_totalStaked();
  const mUmamiDecimalsCallResult = mUMAMIContract.try_decimals();
  const compoundingCallResult = cmUMAMIContract.try_totalDeposits();
  const cmUmamiDecimalsCallResult = cmUMAMIContract.try_decimals();
  const sUmamiDecimalsCallResult = sUMAMIContract.try_decimals();

  let foreverLocked = BigDecimal.zero();
  if (!umamiDecimalsCallResult.reverted && !sUmamiDecimalsCallResult.reverted) {
    for (let i = 0; i < FORVER_LOCKED_HOLDERS.length - 1; i += 1) {
      const lockedBalanceOfUMAMI = UMAMIContract.balanceOf(
        FORVER_LOCKED_HOLDERS[i]
      );
      const lockedBalanceOfsUMAMI = sUMAMIContract.balanceOf(
        FORVER_LOCKED_HOLDERS[i]
      );
      foreverLocked = foreverLocked.plus(
        lockedBalanceOfUMAMI
          .toBigDecimal()
          .div(BigDecimal.fromString(`1e${umamiDecimalsCallResult.value}`))
          .plus(
            lockedBalanceOfsUMAMI
              .toBigDecimal()
              .div(BigDecimal.fromString(`1e${sUmamiDecimalsCallResult.value}`))
          )
      );
    }
  }
  supplyBreakdown.foreverLocked = foreverLocked;

  if (totalSupplyCallResult.reverted) {
    supplyBreakdown.totalSupply = BigDecimal.zero();
  } else {
    supplyBreakdown.totalSupply = totalSupplyCallResult.value
      .toBigDecimal()
      .div(BigDecimal.fromString(`1e${umamiDecimalsCallResult.value}`));
  }
  if (marinatingCallResult.reverted) {
    supplyBreakdown.marinating = BigDecimal.zero();
  } else {
    supplyBreakdown.marinating = marinatingCallResult.value
      .toBigDecimal()
      .div(BigDecimal.fromString(`1e${mUmamiDecimalsCallResult.value}`));
  }
  if (compoundingCallResult.reverted) {
    supplyBreakdown.compounding = BigDecimal.zero();
  } else {
    supplyBreakdown.compounding = compoundingCallResult.value
      .toBigDecimal()
      .div(BigDecimal.fromString(`1e${cmUmamiDecimalsCallResult.value}`));
  }

  supplyBreakdown.timestamp = event.block.timestamp;
  supplyBreakdown.block = event.block.number;
  supplyBreakdown.txHash = event.transaction.hash.toHex();

  ethDistribution.block = event.block.number;
  ethDistribution.timestamp = event.block.timestamp;
  ethDistribution.txHash = event.transaction.hash.toHex();
  ethDistribution.ethDistributed = event.params.amount
    .toBigDecimal()
    .div(BigDecimal.fromString("1e18"));

  supplyBreakdown.save();
  ethDistribution.save();
}
