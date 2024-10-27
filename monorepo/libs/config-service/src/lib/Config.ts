import { TokenCategory } from "./client/ConfigDBClient";

interface AuthTokenConfig {
  scopes: string[];
}

export class Config {
  private static requiredAuthScopes: Record<TokenCategory, AuthTokenConfig> = {
    BOT: {
      scopes: ['user:read:chat', 'user:write:chat', 'user:bot'],
    },
    USER: {
      scopes: [],
    },
    REWARDS: {
      scopes: ['channel:bot', 'channel:read:redemptions'],
    }
  };

  public static getAuthScopes(type: TokenCategory) {
    return Config.requiredAuthScopes[type];
  }
}
