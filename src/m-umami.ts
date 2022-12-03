import { BigDecimal } from "@graphprotocol/graph-ts";
import { cmUMAMI } from "../generated/cmUMAMI/cmUMAMI";
import {
  mUMAMI,
  Stake as StakeEvent,
  Withdraw as WithdrawEvent,
} from "../generated/mUMAMI/mUMAMI";
import { MarinatingBalance, SupplyBreakdown } from "../generated/schema";
import { sUMAMI } from "../generated/sUMAMI/sUMAMI";
import { UMAMI } from "../generated/UMAMI/UMAMI";

import {
  CM_UMAMI_ADDRESS,
  FORVER_LOCKED_HOLDERS,
  M_UMAMI_ADDRESS,
  S_UMAMI_ADDRESS,
  UMAMI_ADDRESS,
} from "./addresses";

export function handleStake(event: StakeEvent): void {
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

  if (
    event.params.amount
      .toBigDecimal()
      .div(BigDecimal.fromString(`1e${umamiDecimalsCallResult.value}`))
      .gt(BigDecimal.fromString("0.1"))
  ) {
    const historicalBalance = new MarinatingBalance(
      event.transaction.hash.toHex()
    );
    historicalBalance.event = eventLabel;
    historicalBalance.block = event.block.number;
    historicalBalance.timestamp = event.block.timestamp;
    historicalBalance.user = event.transaction.from.toHexString();
    historicalBalance.value = mUMAMIContract
      .balanceOf(event.transaction.from)
      .toBigDecimal()
      .div(BigDecimal.fromString(`1e${umamiDecimalsCallResult.value}`));

    historicalBalance.save();
  }

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

export function handleWithdraw(event: WithdrawEvent): void {
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

  if (
    event.params.amount
      .toBigDecimal()
      .div(BigDecimal.fromString(`1e${umamiDecimalsCallResult.value}`))
      .gt(BigDecimal.fromString("0.1"))
  ) {
    const historicalBalance = new MarinatingBalance(
      event.transaction.hash.toHex()
    );
    historicalBalance.event = eventLabel;
    historicalBalance.block = event.block.number;
    historicalBalance.timestamp = event.block.timestamp;
    historicalBalance.user = event.transaction.from.toHexString();
    historicalBalance.value = mUMAMIContract
      .balanceOf(event.transaction.from)
      .toBigDecimal()
      .div(BigDecimal.fromString(`1e${umamiDecimalsCallResult.value}`));

    historicalBalance.save();
  }

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
