import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  AddToContractWhitelist,
  Approval,
  OwnershipTransferred,
  RemoveFromContractWhitelist,
  RewardAdded,
  RewardClaimed,
  RewardCollection,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Stake,
  StakeMultiplier,
  Transfer,
  Withdraw,
  WithdrawMultiplier
} from "../generated/mUMAMI/mUMAMI"

export function createAddToContractWhitelistEvent(
  _contract: Address
): AddToContractWhitelist {
  let addToContractWhitelistEvent = changetype<AddToContractWhitelist>(
    newMockEvent()
  )

  addToContractWhitelistEvent.parameters = new Array()

  addToContractWhitelistEvent.parameters.push(
    new ethereum.EventParam("_contract", ethereum.Value.fromAddress(_contract))
  )

  return addToContractWhitelistEvent
}

export function createApprovalEvent(
  owner: Address,
  spender: Address,
  value: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("spender", ethereum.Value.fromAddress(spender))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return approvalEvent
}

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createRemoveFromContractWhitelistEvent(
  _contract: Address
): RemoveFromContractWhitelist {
  let removeFromContractWhitelistEvent = changetype<
    RemoveFromContractWhitelist
  >(newMockEvent())

  removeFromContractWhitelistEvent.parameters = new Array()

  removeFromContractWhitelistEvent.parameters.push(
    new ethereum.EventParam("_contract", ethereum.Value.fromAddress(_contract))
  )

  return removeFromContractWhitelistEvent
}

export function createRewardAddedEvent(
  token: Address,
  amount: BigInt,
  rps: BigInt
): RewardAdded {
  let rewardAddedEvent = changetype<RewardAdded>(newMockEvent())

  rewardAddedEvent.parameters = new Array()

  rewardAddedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  rewardAddedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  rewardAddedEvent.parameters.push(
    new ethereum.EventParam("rps", ethereum.Value.fromUnsignedBigInt(rps))
  )

  return rewardAddedEvent
}

export function createRewardClaimedEvent(
  token: Address,
  staker: Address,
  amount: BigInt
): RewardClaimed {
  let rewardClaimedEvent = changetype<RewardClaimed>(newMockEvent())

  rewardClaimedEvent.parameters = new Array()

  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam("staker", ethereum.Value.fromAddress(staker))
  )
  rewardClaimedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return rewardClaimedEvent
}

export function createRewardCollectionEvent(
  token: Address,
  addr: Address,
  amount: BigInt
): RewardCollection {
  let rewardCollectionEvent = changetype<RewardCollection>(newMockEvent())

  rewardCollectionEvent.parameters = new Array()

  rewardCollectionEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(token))
  )
  rewardCollectionEvent.parameters.push(
    new ethereum.EventParam("addr", ethereum.Value.fromAddress(addr))
  )
  rewardCollectionEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return rewardCollectionEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createStakeEvent(
  addr: Address,
  amount: BigInt,
  multipliedAmount: BigInt
): Stake {
  let stakeEvent = changetype<Stake>(newMockEvent())

  stakeEvent.parameters = new Array()

  stakeEvent.parameters.push(
    new ethereum.EventParam("addr", ethereum.Value.fromAddress(addr))
  )
  stakeEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  stakeEvent.parameters.push(
    new ethereum.EventParam(
      "multipliedAmount",
      ethereum.Value.fromUnsignedBigInt(multipliedAmount)
    )
  )

  return stakeEvent
}

export function createStakeMultiplierEvent(
  addr: Address,
  nft: Address,
  tokenId: BigInt,
  multipliedAmount: BigInt
): StakeMultiplier {
  let stakeMultiplierEvent = changetype<StakeMultiplier>(newMockEvent())

  stakeMultiplierEvent.parameters = new Array()

  stakeMultiplierEvent.parameters.push(
    new ethereum.EventParam("addr", ethereum.Value.fromAddress(addr))
  )
  stakeMultiplierEvent.parameters.push(
    new ethereum.EventParam("nft", ethereum.Value.fromAddress(nft))
  )
  stakeMultiplierEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  stakeMultiplierEvent.parameters.push(
    new ethereum.EventParam(
      "multipliedAmount",
      ethereum.Value.fromUnsignedBigInt(multipliedAmount)
    )
  )

  return stakeMultiplierEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  value: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromUnsignedBigInt(value))
  )

  return transferEvent
}

export function createWithdrawEvent(addr: Address, amount: BigInt): Withdraw {
  let withdrawEvent = changetype<Withdraw>(newMockEvent())

  withdrawEvent.parameters = new Array()

  withdrawEvent.parameters.push(
    new ethereum.EventParam("addr", ethereum.Value.fromAddress(addr))
  )
  withdrawEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return withdrawEvent
}

export function createWithdrawMultiplierEvent(
  addr: Address,
  nft: Address,
  tokenId: BigInt,
  multipliedAmount: BigInt
): WithdrawMultiplier {
  let withdrawMultiplierEvent = changetype<WithdrawMultiplier>(newMockEvent())

  withdrawMultiplierEvent.parameters = new Array()

  withdrawMultiplierEvent.parameters.push(
    new ethereum.EventParam("addr", ethereum.Value.fromAddress(addr))
  )
  withdrawMultiplierEvent.parameters.push(
    new ethereum.EventParam("nft", ethereum.Value.fromAddress(nft))
  )
  withdrawMultiplierEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  withdrawMultiplierEvent.parameters.push(
    new ethereum.EventParam(
      "multipliedAmount",
      ethereum.Value.fromUnsignedBigInt(multipliedAmount)
    )
  )

  return withdrawMultiplierEvent
}
