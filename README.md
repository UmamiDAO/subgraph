# Umami Finance subgraph

This subgraphs indexes UMAMI Finance contracts.

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

Watches the ETH amount distributed to stakers on each `RewardAdded` event triggered by the reward receiver contract.

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

## User staking history

Watches the balance history of a user in the staking contracts.

> To prevent registering bots trying to farm a potential Arbitrum airdrop, a 0.1 UMAMI minimum transaction amount is required to trigger the entity creation.

`MarinatingBalance` and `CompoundingBalance` are the two entities tracking the balances, both are built the same way.

- Event : `m-umami-deposit | m-umami-withdraw | cm-umami-deposit | cm-umami-withdraw`
- Value : UMAMI amount carried by the transaction
- User : the user associated with the transaction

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
    user
    event
    value
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
    user
    event
    value
  }
}
```
