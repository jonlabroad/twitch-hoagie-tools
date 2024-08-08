import TokenDbClient from "../Persistance/TokenDBClient";

export class GetTokensHandler {
  private tokenDbClient: TokenDbClient;

  constructor(tokenDbClient: TokenDbClient) {
    this.tokenDbClient = tokenDbClient
  }

  public async handle(streamId: string) {
    const tokens = await this.tokenDbClient.readTokens(streamId);
    return tokens;
  }
}
