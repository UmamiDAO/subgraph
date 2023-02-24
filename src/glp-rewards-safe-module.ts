import { GlpWethRewardsDistributed } from "../generated/schema";
import { GlpWethRewardsDistributed as GlpWethRewardsDistributedEvent } from "../generated/glpRewardsSafeModule/GlpRewardsSafeModule";

export function handleGlpWethRewardsDistributed(
  event: GlpWethRewardsDistributedEvent
): void {
  const rewardsDistributionId = event.transaction.hash.toHex();
  const rewardsDistribution = new GlpWethRewardsDistributed(
    rewardsDistributionId
  );
  rewardsDistribution.block = event.block.number;
  rewardsDistribution.timestamp = event.block.timestamp;
  rewardsDistribution.txHash = event.transaction.hash.toHex();
  rewardsDistribution.amountDistributed = event.params._amountDistributed;
  rewardsDistribution.totalClaimed = event.params._totalClaimed;
  rewardsDistribution.save();
}
