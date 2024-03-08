import { DynamoDB } from 'aws-sdk';

import { TokenResponse } from '@hoagie/service-clients';
import { createTwitchClient } from './createTwitchClient';

export interface DbTokenValue {
  username: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  timestamp: string;
}

export default class SpotifyDbClient {
  public static readonly SECRETS_CATEGORY = 'SECRETS';
  public static readonly STREAMER_SONGLIST_SUBCAT = 'spotifyToken';

  public static readonly SPOTIFY_CATEGORY = 'SPOTIFY';
  public static readonly PLAYLIST_SUBCAT = 'playlist';

  private readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public async setToken(
    username: string,
    tokenData: TokenResponse,
    refresh_token?: string
  ) {
    const client = new DynamoDB.DocumentClient();

    const twitchClient = createTwitchClient();
    const userId = (await twitchClient.getUserId(username)) ?? 'ERROR';

    const request: any = {
      TableName: this.tableName,
      Item: {
        CategoryKey: `${userId.toString()}_${SpotifyDbClient.SECRETS_CATEGORY}`,
        SubKey: SpotifyDbClient.STREAMER_SONGLIST_SUBCAT,
        Value: {
          username: username,
          refresh_token,
          ...tokenData,
          timestamp: new Date().toISOString(),
        },
      },
    };
    const response = await client.put(request).promise();
    console.log(response);
  }

  public async getToken(streamerName: string): Promise<any | undefined> {
    const client = new DynamoDB.DocumentClient();
    const twitchClient = createTwitchClient();
    const userId = (await twitchClient.getUserId(streamerName)) ?? 'ERROR';

    const request: any = {
      TableName: this.tableName,
      Key: {
        CategoryKey: `${userId.toString()}_${SpotifyDbClient.SECRETS_CATEGORY}`,
        SubKey: SpotifyDbClient.STREAMER_SONGLIST_SUBCAT,
      },
    };
    const response = await client.get(request).promise();
    return response?.Item?.['Value'];
  }

  public async setPlaylist(streamerName: string, playlistId: string) {
    const client = new DynamoDB.DocumentClient();
    const twitchClient = createTwitchClient();

    const streamerId = (await twitchClient.getUserId(streamerName)) ?? 'ERROR';

    const request: any = {
      TableName: this.tableName,
      Item: {
        CategoryKey: `${streamerId.toString()}_${SpotifyDbClient.SPOTIFY_CATEGORY}`,
        SubKey: SpotifyDbClient.PLAYLIST_SUBCAT,
        Value: {
          playlistId,
        },
      },
    };
    const response = await client.put(request).promise();
    console.log(response);
  }

  public async getPlaylist(streamerName: string) {
    const client = new DynamoDB.DocumentClient();
    const twitchClient = createTwitchClient();
    const userId = (await twitchClient.getUserId(streamerName)) ?? 'ERROR';

    const request: any = {
      TableName: this.tableName,
      Key: {
        CategoryKey: `${userId.toString()}_${SpotifyDbClient.SPOTIFY_CATEGORY}`,
        SubKey: SpotifyDbClient.PLAYLIST_SUBCAT,
      },
    };
    const response = await client.get(request).promise();
    return response?.Item?.['Value']?.playlistId;
  }
}
