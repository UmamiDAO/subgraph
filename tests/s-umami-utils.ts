import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  sUMAMIApproval,
  LogRebase,
  LogStakingContractUpdated,
  LogSupply,
  OwnershipPulled,
  OwnershipPushed,
  sUMAMITransfer
} from "../generated/sUMAMI/sUMAMI"

export function createsUMAMIApprovalEvent(
  owner: Address,
  spender: Address,
  value: BigInt
): sUMAMIApproval {
  let sUmamiApprovalEvent = changetype<sUMAMIApproval>(newMockEvent())

  sUmamiApprovalEvent.parameters = new Array()

  sUmamiApprovalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  sUmamiApprovalEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  )
  sUmamiApprovalEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return sUmamiApprovalEvent
}

export function createLogRebaseEvent(
  epoch: BigInt,
  rebase: BigInt,
  index: BigInt
): LogRebase {
  let logRebaseEvent = changetype<LogRebase>(newMockEvent())

  logRebaseEvent.parameters = new Array()

  logRebaseEvent.parameters.push(
    new ethereum.EventParam("epoch", ethereum.Value.fromUnsignedBigInt(epoch))
  )
  logRebaseEvent.parameters.push(
    new ethereum.EventParam("rebase", ethereum.Value.fromUnsignedBigInt(rebase))
  )
  logRebaseEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )

  return logRebaseEvent
}

export function createLogStakingContractUpdatedEvent(
  stakingContract: Address
): LogStakingContractUpdated {
  let logStakingContractUpdatedEvent = changetype<LogStakingContractUpdated>(
    newMockEvent()
  )

  logStakingContractUpdatedEvent.parameters = new Array()

  logStakingContractUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "stakingContract",
      ethereum.Value.fromAddress(stakingContract)
    )
  )

  return logStakingContractUpdatedEvent
}

export function createLogSupplyEvent(
  epoch: BigInt,
  timestamp: BigInt,
  totalSupply: BigInt
): LogSupply {
  let logSupplyEvent = changetype<LogSupply>(newMockEvent())

  logSupplyEvent.parameters = new Array()

  logSupplyEvent.parameters.push(
    new ethereum.EventParam("epoch", ethereum.Value.fromUnsignedBigInt(epoch))
  )
  logSupplyEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  logSupplyEvent.parameters.push(
    new ethereum.EventParam(
      "totalSupply",
      ethereum.Value.fromUnsignedBigInt(totalSupply)
    )
  )

  return logSupplyEvent
}

export function createOwnershipPulledEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipPulled {
  let ownershipPulledEvent = changetype<OwnershipPulled>(newMockEvent())

  ownershipPulledEvent.parameters = new Array()

  ownershipPulledEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipPulledEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipPulledEvent
}

export function createOwnershipPushedEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipPushed {
  let ownershipPushedEvent = changetype<OwnershipPushed>(newMockEvent())

  ownershipPushedEvent.parameters = new Array()

  ownershipPushedEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipPushedEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipPushedEvent
}

export function createsUMAMITransferEvent(
  from: Address,
  to: Address,
  value: BigInt
): sUMAMITransfer {
  let sUmamiTransferEvent = changetype<sUMAMITransfer>(newMockEvent())

  sUmamiTransferEvent.parameters = new Array()

  sUmamiTransferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  sUmamiTransferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  sUmamiTransferEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return sUmamiTransferEvent
}
