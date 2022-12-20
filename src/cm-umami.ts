import { BigDecimal } from "@graphprotocol/graph-ts";
import {
  cmUMAMI,
  Deposit as CompoundDeposit,
  Reinvest as CompoundReinvest,
  Transfer as CompoundTransfer,
  Withdraw as CompoundWithdraw,
} from "../generated/cmUMAMI/cmUMAMI";
import { mUMAMI } from "../generated/mUMAMI/mUMAMI";

import {
  CompoundingBalance,
  PpsEntity,
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

export function handleTransfer(event: CompoundTransfer): void {
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
        fromTotal.marinating = BigDecimal.zero();
        fromTotal.compounding = amount;
      } else {
        fromTotal.compounding = fromTotal.compounding.minus(amount);
      }
      fromTotal.save();

      const fromHistoricalBalance = new CompoundingBalance(
        `${event.block.number}:${from}`
      );
      fromHistoricalBalance.block = event.block.number;
      fromHistoricalBalance.timestamp = event.block.timestamp;
      fromHistoricalBalance.user = from;
      fromHistoricalBalance.value = fromTotal.compounding;

      fromHistoricalBalance.save();
    }

    const to = event.params.to.toHexString();

    // unstaking event
    if (to != ZERO_ADDRESS) {
      const idToTotal = `total:${to}`;
      let toTotal = UserBalanceTotal.load(idToTotal);
      if (toTotal == null) {
        toTotal = new UserBalanceTotal(idToTotal);
        toTotal.marinating = BigDecimal.zero();
        toTotal.compounding = amount;
      } else {
        toTotal.compounding = toTotal.compounding.plus(amount);
      }
      toTotal.save();

      const toHistoricalBalance = new CompoundingBalance(
        `${event.block.number}:${to}`
      );
      toHistoricalBalance.block = event.block.number;
      toHistoricalBalance.timestamp = event.block.timestamp;
      toHistoricalBalance.user = to;
      toHistoricalBalance.value = toTotal.compounding;

      toHistoricalBalance.save();
    }
  }
}

export function handleReinvest(event: CompoundReinvest): void {
  let ppsEntity = new PpsEntity(event.transaction.hash.toHex());
  const cmUMAMIContract = cmUMAMI.bind(event.address);
  const deposits = cmUMAMIContract.totalDeposits();
  const supply = cmUMAMIContract.totalSupply();

  ppsEntity.block = event.block.number;
  ppsEntity.timestamp = event.block.timestamp;
  ppsEntity.txHash = event.transaction.hash.toHex();
  ppsEntity.pricePerShare = deposits.toBigDecimal().div(supply.toBigDecimal());
  ppsEntity.save();
}

export function handleDeposit(event: CompoundDeposit): void {
  const eventLabel = "cm-umami-deposit";
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

export function handleWithdraw(event: CompoundWithdraw): void {
  const eventLabel = "cm-umami-withdraw";
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
