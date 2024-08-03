export type RewardTokenType = "sub";
export type TokenSubType = "1000" | "2000" | "3000";

export interface RewardToken {
  ownerId: string;
  broadcasterId: string;
  ownerUsername: string; // informational only! Not guaranteed to be accurate
  key: string; // Keys with defined key overwrite any existing tokens of the same key
  type: RewardTokenType;
  subType: TokenSubType;
  value: number;
  grantTimestamp: Date;
  expiryTimestamp: Date | null;
}
