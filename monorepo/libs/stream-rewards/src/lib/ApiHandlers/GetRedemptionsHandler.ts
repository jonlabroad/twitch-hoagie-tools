import TokenDbClient from "../Persistance/TokenDBClient";

export class GetRedemptionsHandler {
  private tokenDbClient: TokenDbClient;

  constructor(tokenDbClient: TokenDbClient) {
    this.tokenDbClient = tokenDbClient
  }

  public async handle(streamId: string) {
    const redemptions = await this.tokenDbClient.readRedemptions(streamId);
    return redemptions;
  }
}
