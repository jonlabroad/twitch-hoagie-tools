import Config from "../../Config";

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
  scopes: ["channel:bot channel:read:redemptions"]
};

export function createConnectRedirectUri(config: ConnectionConfig): string {
  return `https://config.hoagieman.net/api/v1/access/twitchtoken/${config.type.toLowerCase()}`;
}

export function createConnectUrl(config: ConnectionConfig): string {
  const redirectUri = createConnectRedirectUri(config);
  return `https://id.twitch.tv/oauth2/authorize?scope=${config.scopes.join(' ')}&client_id=${Config.clientId}&redirect_uri=${redirectUri}&response_type=code&force_verify=true`;
}
