export interface ConnectionConfig {
  type: string;
  scopes: string[];
}

export type ConnectionType = "BOT" | "REWARDS";

export const botAccountConnectionConfig: ConnectionConfig = {
  type: "BOT",
  scopes: ["user:read:chat user:write:chat user:bot"]
};

export const streamRewardsConnectionConfig: ConnectionConfig = {
  type: "REWARDS",
  scopes: ["channel:bot channel:manage:redemptions"]
};
