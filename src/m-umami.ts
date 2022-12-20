import { BigDecimal, log } from "@graphprotocol/graph-ts";
import { cmUMAMI } from "../generated/cmUMAMI/cmUMAMI";
import {
  mUMAMI,
  Stake as MarinateStake,
  Transfer as MarinateTransfer,
  Withdraw as MarinateWithdraw,
} from "../generated/mUMAMI/mUMAMI";
import {
  MarinatingBalance,
  SupplyBreakdown,
  UserBalanceTotal,
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

    // staking event
    if (from != ZERO_ADDRESS) {
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
      fromHistoricalBalance.user = from;
      fromHistoricalBalance.value = fromTotal.marinating;

      fromHistoricalBalance.save();
    }

    const to = event.params.to.toHexString();

    // unstaking or compounding event
    if (to != ZERO_ADDRESS && to != CM_UMAMI_ADDRESS.toHexString()) {
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
      toHistoricalBalance.user = to;
      toHistoricalBalance.value = toTotal.marinating;

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
