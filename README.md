# Umami DAO subgraph

This subgraphs indexes UMAMI DAO contracts.

- [Graph URL](https://thegraph.com/hosted-service/subgraph/umamidao/protocol-metrics)
- [Graph API URL](https://api.thegraph.com/subgraphs/name/umamidao/protocol-metrics)

Contract addresses can be found in `src/addresses.ts`.

## cmUMAMI price per share ratio

Watches the cmUMAMI:UMAMI ratio on each `Reinvest` event triggered by the compoundor contract.

```graphql
{
  ppsEntities(first: 1000, orderBy: block, orderDirection: desc) {
    id
    block
    timestamp
    txHash
    pricePerShare
  }
}
```

## ETH staking distribution

Watches the ETH amount distributed to stakers on each `RewardAdded` event triggered by the mUMAMI contract.

```graphql
{
  ethDistributions(first: 1000, orderBy: block, orderDirection: desc) {
    id
    block
    timestamp
    txHash
    ethDistributed
  }
}
```

Since permisionless claim and distribution has been enabled via a Safe module, another event has been added to keep track of claims and distribution.

```graphql
{
  glpWethRewardsDistributeds(
    first: 1000
    orderBy: block
    orderDirection: desc
  ) {
    id
    block
    timestamp
    txHash
    totalClaimed
    amountDistributed
  }
}
```

## Token supply distribution

Watches distribution of the UMAMI token supply

- Total supply : current max supply of UMAMI
- Marinating : supply deposited in Marinator contract ( mUMAMI )
- Compounding : supply deposited in Compoundor contract ( cmUMAMI )
- Forever locked : supply dedicated to the old token migration

> Note : the supply forever locked will lower over time as people migrate from the old sUMAMI model

The supply is tracked on 5 events :

- `Stake` / `Withdraw` from Marinator
- `Deposit` / `Withdraw` from Compoundor
- `RewardAdded` from the rewards receiver

```graphql
{
  supplyBreakdowns(first: 1000, orderBy: block, orderDirection: desc) {
    id
    block
    timestamp
    totalSupply
    marinating
    compounding
    foreverLocked
  }
}
```

## User claimed rewards

Watches the `RewardClaimed` event of mUMAMI to register an user's claimed rewards transactions.

```graphql
{
  rewardsClaims(
    first: 1000
    orderBy: block
    orderDirection: desc
    where: { user: "user address" }
  ) {
    id
    timestamp
    block
    txHash
    event
    user
    token
    rewards
  }
```

## User staking history

Watches the balance history of a user in the staking contracts.

> To prevent registering bots trying to farm a potential Arbitrum airdrop, a 0.1 UMAMI minimum transaction amount is required to trigger the entity creation.

`MarinatingBalance` and `CompoundingBalance` are the two entities tracking the balances, both are built the same way.

- Value : mUMAMI or cmUMAMI amount carried by the transaction
- User : the user associated with the transaction
- Event : The event associated with the transaction, can be one of the following

`marinate` : Deposited UMAMI and received mUMAMI
`withdraw` : Burnt (c)mUMAMI and received (m)UMAMI
`transfer` : Transfer of (c)mUMAMI between two addresses
`compoumnd` : Deposited mUMAMI and received cmUMAMI

This tracks the `Transfer` event of both mUMAMI and cmUMAMI creates entities from the `to` and `from` parameters.

`transferFrom` and `transferTo` are only present for a legitimate `transfer`.

```graphql
{
  marinatingBalances(
    first: 1000
    orderBy: block
    orderDirection: desc
    where: { user: "user address" }
  ) {
    id
    timestamp
    block
    txHash
    event
    user
    value
    transferFrom
    transferTo
  }

  compoundingBalances(
    first: 1000
    orderBy: block
    orderDirection: desc
    where: { user: "user address" }
  ) {
    id
    timestamp
    block
    txHash
    event
    user
    value
    transferFrom
    transferTo
  }
}
```
