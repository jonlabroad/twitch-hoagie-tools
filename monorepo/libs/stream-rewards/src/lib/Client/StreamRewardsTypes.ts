import { CustomReward } from "@hoagie/service-clients";

export interface TokenType {
  expiryTimestamp: number;
  Expiry: number;
  value: number;
  CategoryKey: string;
  broadcasterId: string;
  ownerUsername: string;
  subType: string;
  grantTimestamp: number;
  key: string;
  SortKey: string;
  ownerId: string;
  type: string;
}

export type GetTokensResponse = TokenType[];

export type GetBroadcasterRedemptionsResponse = CustomReward[];
