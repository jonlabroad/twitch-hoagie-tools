import { IRedemptionInfo, RewardToken } from "../Tokens/RewardToken";

export interface RedemptionResult {
  success: boolean;
  error?: string;
}

export interface ITokenDbClient {
  upsertToken(token: RewardToken): Promise<boolean>;
  readTokens(broadcasterId: string, ownerId: string): Promise<RewardToken[]>
  redeemToken(broadcasterId: string, ownerId: string, key: string, redemptionInfo: IRedemptionInfo): Promise<RedemptionResult>;
}
