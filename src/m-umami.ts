import { BigDecimal } from "@graphprotocol/graph-ts";
import { cmUMAMI } from "../generated/cmUMAMI/cmUMAMI";
import {
  mUMAMI,
  RewardAdded,
  RewardClaimed as RewardsClaimedEvent,
  Stake as MarinateStake,
  Transfer as MarinateTransfer,
  Withdraw as MarinateWithdraw,
} from "../generated/mUMAMI/mUMAMI";
import {
  MarinatingBalance,
  SupplyBreakdown,
  UserBalanceTotal,
  RewardsClaim,
  EthDistribution,
} from "../generated/schema";
import { sUMAMI } from "../generated/sUMAMI/sUMAMI";
import { UMAMI } from "../generated/UMAMI/UMAMI";

import {
  CM_UMAMI_ADDRESS,
  FORVER_LOCKED_HOLDERS,
  M_UMAMI_ADDRESS,
  S_UMAMI_ADDRESS,
  UMAMI_ADDRESS,
} from "./addresses";

const ZERO_ADDRESS: string = "0x0000000000000000000000000000000000000000";

export function handleTransfer(event: MarinateTransfer): void {
  const amount = event.params.value
    .toBigDecimal()
    .div(BigDecimal.fromString("1e9"));

  if (amount.gt(BigDecimal.fromString("0.1"))) {
    const from = event.params.from.toHexString();
    const to = event.params.to.toHexString();

    // Any event not listed below is considered a transfer
    let balanceEvent = "transfer";
    // User staked his UMAMI as mUMAMI
    if (from == ZERO_ADDRESS) {
      balanceEvent = "marinate";
    }
    // User unstaked his mUMAMI to receive UMAMI back
    if (to == ZERO_ADDRESS) {
      balanceEvent = "withdraw";
    }
    // User sent his mUMAMI to the cmUMAMI contract
    if (to == CM_UMAMI_ADDRESS.toHexString()) {
      balanceEvent = "compound";
    }

    // ZERO_ADDRESS = staking event, don't register ZERO_ADDRESS's balance
    if (from != ZERO_ADDRESS) {
      // Use "fromTotal" as a Graph variable carrying the balance changes
      const idFromTotal = `total:${from}`;
      let fromTotal = UserBalanceTotal.load(idFromTotal);
      if (fromTotal == null) {
        fromTotal = new UserBalanceTotal(idFromTotal);
        fromTotal.marinating = amount;
        fromTotal.compounding = BigDecimal.zero();
      } else {
        fromTotal.marinating = fromTotal.marinating.minus(amount);
      }
      fromTotal.save();

      const fromHistoricalBalance = new MarinatingBalance(
        `${event.block.number}:${from}`
      );
      fromHistoricalBalance.block = event.block.number;
      fromHistoricalBalance.timestamp = event.block.timestamp;
      fromHistoricalBalance.txHash = event.transaction.hash.toHex();
      fromHistoricalBalance.user = from;
      fromHistoricalBalance.value = fromTotal.marinating;
      fromHistoricalBalance.event = balanceEvent;
      fromHistoricalBalance.transferTo = balanceEvent === "transfer" ? to : "";
      fromHistoricalBalance.transferFrom = from;

      fromHistoricalBalance.save();
    }

    // ZERO_ADDRESS = unstaking event, don't register ZERO_ADDRESS's balance
    // CM_UMAMI_ADDRESS = compounding event, don't register CM_UMAMI_ADDRESS's balance
    if (to != ZERO_ADDRESS && to != CM_UMAMI_ADDRESS.toHexString()) {
      // Use "toTotal" as a Graph variable carrying the balance changes
      const idToTotal = `total:${to}`;
      let toTotal = UserBalanceTotal.load(idToTotal);
      if (toTotal == null) {
        toTotal = new UserBalanceTotal(idToTotal);
        toTotal.marinating = amount;
        toTotal.compounding = BigDecimal.zero();
      } else {
        toTotal.marinating = toTotal.marinating.plus(amount);
      }
      toTotal.save();

      const toHistoricalBalance = new MarinatingBalance(
        `${event.block.number}:${to}`
      );
      toHistoricalBalance.block = event.block.number;
      toHistoricalBalance.timestamp = event.block.timestamp;
      toHistoricalBalance.txHash = event.transaction.hash.toHex();
      toHistoricalBalance.user = to;
      toHistoricalBalance.value = toTotal.marinating;
      toHistoricalBalance.event = balanceEvent;
      toHistoricalBalance.transferFrom =
        balanceEvent === "transfer" ? from : "";
      toHistoricalBalance.transferTo = to;

      toHistoricalBalance.save();
    }
  }
}

export function handleStake(event: MarinateStake): void {
  const eventLabel = "m-umami-deposit";
  let supplyBreakdown = new SupplyBreakdown(event.transaction.hash.toHex());
  supplyBreakdown.event = eventLabel;
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
      foreverLocked = foreverLocked
        .plus(
          lockedBalanceOfUMAMI
            .toBigDecimal()
            .div(BigDecimal.fromString(`1e${umamiDecimalsCallResult.value}`))
        )
        .plus(
          lockedBalanceOfsUMAMI
            .toBigDecimal()
            .div(BigDecimal.fromString(`1e${sUmamiDecimalsCallResult.value}`))
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

  supplyBreakdown.save();
}

export function handleWithdraw(event: MarinateWithdraw): void {
  const eventLabel = "m-umami-withdraw";
  let supplyBreakdown = new SupplyBreakdown(event.transaction.hash.toHex());
  supplyBreakdown.event = eventLabel;
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
      foreverLocked = foreverLocked
        .plus(
          lockedBalanceOfUMAMI
            .toBigDecimal()
            .div(BigDecimal.fromString(`1e${umamiDecimalsCallResult.value}`))
        )
        .plus(
          lockedBalanceOfsUMAMI
            .toBigDecimal()
            .div(BigDecimal.fromString(`1e${sUmamiDecimalsCallResult.value}`))
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

  supplyBreakdown.save();
}

export function handleRewardsClaimed(event: RewardsClaimedEvent): void {
  const rewardsClaimedId = event.transaction.hash.toHex();
  const rewardsClaimed = new RewardsClaim(rewardsClaimedId);
  rewardsClaimed.block = event.block.number;
  rewardsClaimed.timestamp = event.block.timestamp;
  rewardsClaimed.txHash = event.transaction.hash.toHex();
  rewardsClaimed.event = "claim";
  rewardsClaimed.token = event.params.token.toHexString();
  rewardsClaimed.user = event.params.staker.toHexString();
  rewardsClaimed.rewards = event.params.amount;
  rewardsClaimed.save();
}

export function handleRewardsAdded(event: RewardAdded): void {
  let ethDistribution = new EthDistribution(event.transaction.hash.toHex());
  ethDistribution.block = event.block.number;
  ethDistribution.timestamp = event.block.timestamp;
  ethDistribution.txHash = event.transaction.hash.toHex();
  ethDistribution.ethDistributed = event.params.amount
    .toBigDecimal()
    .div(BigDecimal.fromString("1e18"));
  ethDistribution.save();

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
  supplyBreakdown.save();
}
