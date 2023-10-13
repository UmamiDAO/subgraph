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
  CompoundingPricePerShare,
  PpsEntity,
  SupplyBreakdown,
  UserBalanceEvent,
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
    const to = event.params.to.toHexString();
    const idFromTotal = `total:${from}`;
    const idToTotal = `total:${to}`;

    // Any event not listed below is considered a transfer
    let balanceEvent = "transfer";
    // User staked his mUMAMI as cmUMAMI
    if (from == ZERO_ADDRESS) {
      balanceEvent = "compound";
    }
    // User unstaked his cmUMAMI to receive mUMAMI back
    if (to == ZERO_ADDRESS) {
      balanceEvent = "withdraw";
    }

    // ZERO_ADDRESS = staking event, don't register ZERO_ADDRESS's balance
    if (from != ZERO_ADDRESS) {
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
      fromHistoricalBalance.txHash = event.transaction.hash.toHex();
      fromHistoricalBalance.user = from;
      fromHistoricalBalance.value = fromTotal.compounding;
      fromHistoricalBalance.event = balanceEvent;
      fromHistoricalBalance.transferTo = balanceEvent === "transfer" ? to : "";
      fromHistoricalBalance.transferFrom = from;

      fromHistoricalBalance.save();
    }

    // ZERO_ADDRESS = unstaking event, don't register ZERO_ADDRESS's balance
    if (to != ZERO_ADDRESS) {
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
      toHistoricalBalance.txHash = event.transaction.hash.toHex();
      toHistoricalBalance.user = to;
      toHistoricalBalance.value = toTotal.compounding;
      toHistoricalBalance.event = balanceEvent;
      toHistoricalBalance.transferFrom =
        balanceEvent === "transfer" ? from : "";
      toHistoricalBalance.transferTo = to;

      toHistoricalBalance.save();
    }
  }
}

export function handleReinvest(event: CompoundReinvest): void {
  const ppsEntity = new PpsEntity(event.transaction.hash.toHex());
  const compoundingPricePerShare = new CompoundingPricePerShare(
    event.transaction.hash.toHex()
  );

  const cmUMAMIContract = cmUMAMI.bind(event.address);
  const deposits = cmUMAMIContract.totalDeposits();
  const supply = cmUMAMIContract.totalSupply();

  compoundingPricePerShare.block = event.block.number;
  compoundingPricePerShare.timestamp = event.block.timestamp;
  compoundingPricePerShare.txHash = event.transaction.hash.toHex();
  compoundingPricePerShare.pricePerShare = deposits
    .toBigDecimal()
    .div(supply.toBigDecimal());
  compoundingPricePerShare.save();

  ppsEntity.block = event.block.number;
  ppsEntity.timestamp = event.block.timestamp;
  ppsEntity.txHash = event.transaction.hash.toHex();
  ppsEntity.pricePerShare = deposits.toBigDecimal().div(supply.toBigDecimal());
  ppsEntity.save();
}

export function handleDeposit(event: CompoundDeposit): void {
  const eventLabel = "cm-umami-deposit";
  const supplyBreakdown = new SupplyBreakdown(event.transaction.hash.toHex());
  supplyBreakdown.event = eventLabel;
  const userBalanceEvent = new UserBalanceEvent(event.transaction.hash.toHex());

  userBalanceEvent.block = event.block.number;
  userBalanceEvent.timestamp = event.block.timestamp;
  userBalanceEvent.txHash = event.transaction.hash.toHexString();
  userBalanceEvent.event = "deposit";
  userBalanceEvent.token = CM_UMAMI_ADDRESS.toHexString();
  userBalanceEvent.user = event.params.account.toHexString();
  userBalanceEvent.amount = event.params.amount;
  userBalanceEvent.from = event.params.account.toHexString();
  userBalanceEvent.to = CM_UMAMI_ADDRESS.toHexString();
  userBalanceEvent.save();

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
  const userBalanceEvent = new UserBalanceEvent(event.transaction.hash.toHex());

  userBalanceEvent.block = event.block.number;
  userBalanceEvent.timestamp = event.block.timestamp;
  userBalanceEvent.txHash = event.transaction.hash.toHexString();
  userBalanceEvent.event = "withdraw";
  userBalanceEvent.token = CM_UMAMI_ADDRESS.toHexString();
  userBalanceEvent.user = event.params.account.toHexString();
  userBalanceEvent.amount = event.params.amount;
  userBalanceEvent.from = CM_UMAMI_ADDRESS.toHexString();
  userBalanceEvent.to = event.params.account.toHexString();
  userBalanceEvent.save();

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
