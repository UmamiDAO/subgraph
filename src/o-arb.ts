import {
  Vesting,
  PositionClosed,
  EmergencyWithdraw,
} from "../generated/oArbVester/oArbVester";
import {
  EmergencyWithdrawEvent,
  PositionClosedEvent,
  oArbVestingEvent,
} from "../generated/schema";

export function handleoArbVesting(event: Vesting): void {
  const vestingId = event.transaction.hash.toHex();
  const vestingEvent = new oArbVestingEvent(vestingId);
  vestingEvent.block = event.block.number;
  vestingEvent.timestamp = event.block.timestamp;
  vestingEvent.txHash = event.transaction.hash.toHex();
  vestingEvent.user = event.params.owner.toHexString();
  vestingEvent.amount = event.params.amount;
  vestingEvent.nftId = event.params.vestingId;
  vestingEvent.duration = event.params.duration;

  vestingEvent.save();
}

export function handleoArbPositionClosed(event: PositionClosed): void {
  const vestingId = event.transaction.hash.toHex();
  const vestingEvent = new PositionClosedEvent(vestingId);
  vestingEvent.block = event.block.number;
  vestingEvent.timestamp = event.block.timestamp;
  vestingEvent.txHash = event.transaction.hash.toHex();
  vestingEvent.user = event.params.owner.toHexString();
  vestingEvent.nftId = event.params.vestingId;

  vestingEvent.save();
}

export function handleoArbEmergencyWithdraw(event: EmergencyWithdraw): void {
  const vestingId = event.transaction.hash.toHex();
  const vestingEvent = new EmergencyWithdrawEvent(vestingId);
  vestingEvent.block = event.block.number;
  vestingEvent.timestamp = event.block.timestamp;
  vestingEvent.txHash = event.transaction.hash.toHex();
  vestingEvent.user = event.params.owner.toHexString();
  vestingEvent.nftId = event.params.vestingId;

  vestingEvent.save();
}
