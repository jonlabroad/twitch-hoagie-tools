import { TwitchClient } from "@hoagie/service-clients";
import { ConfigDBClient, TokenCategory } from "../client/ConfigDBClient";
import { Config } from "../Config";
import { AccessTokenProvider, AuthTokenDBClient } from "@hoagie/api-util";
import { SecretsProvider } from "@hoagie/secrets-provider";

export interface TwitchTokenValidationParams {
  twitchUserId: string;
  type: TokenCategory;
}

export interface ValidationResult {
  isValid: boolean;
  message: string | undefined;
}

export class TwitchTokenValidator {
  private twitchClient: TwitchClient;
  private dbClient: AuthTokenDBClient;

  constructor(twitchClient: TwitchClient, dbClient: AuthTokenDBClient) {
    this.twitchClient = twitchClient;
    this.dbClient = dbClient;
  }

  public async validate(validationParams: TwitchTokenValidationParams): Promise<ValidationResult> {
    const accessTokenProvider = new AccessTokenProvider(this.dbClient, this.twitchClient);
    try {
      const tokenResult = await accessTokenProvider.readToken(validationParams.twitchUserId, validationParams.type);
      if (!tokenResult) {
        throw new Error("No token found");
      }

      const tokenScopes = tokenResult.scope;
      const requiredScopes = Config.getAuthScopes(validationParams.type).scopes;
      const missingScopes = requiredScopes.filter(scope => !tokenScopes.includes(scope));
      if (missingScopes.length > 0) {
        return {
          isValid: false,
          message: `Missing required scopes: ${missingScopes.join(", ")}`,
        };
      }

      return {
        isValid: true,
        message: undefined,
      };
    } catch (error: any) {
      return {
        isValid: false,
        message: error.message,
      };
    }
  }
}
