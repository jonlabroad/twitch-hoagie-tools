import { TwitchPlusStatusResponse } from "./TwitchPlusData";

export class TwitchPlusClient {
  private readonly endpoint = 'https://gql.twitch.tv/gql';
  private readonly clientId = process.env["PLUSPOINTS_CLIENT_ID"] ?? "NO_CLIENT_ID";
  private readonly headers = {
    'Client-Id': this.clientId,
  };

  async getPlusData(channelId: string): Promise<TwitchPlusStatusResponse> {
    const body = JSON.stringify([
      {
        operationName: 'PartnerPlusPublicQuery',
        variables: { channelID: channelId },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash:
              'b9b3c7607a381300d6ce63451689f85723cd864b28e74e932c1eb5b31cd070bf',
          },
        },
      },
    ]);

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch plus data: ${response.statusText}`);
    }

    const data = await response.json() as TwitchPlusStatusResponse[];
    return data[0];
  }
}
