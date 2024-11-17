import { getAuthHeaders, TokenCategory } from '@hoagie/api-util';
import axios from 'axios';

const BASE_URL = 'https://config.hoagieman.net/api/v1/streamersonglist';
const BASE_URL_DEV = 'https://config-dev.hoagieman.net/api/v1/streamersonglist';

export interface StreamerSongListTokenRequest {
  token: string;
}

export class StreamerSongListApiClient {
  environment: 'prod' | 'dev';
  url: string;
  userId: string;
  accessToken: string;

  constructor(userId: string, accessToken: string, environment: 'prod' | 'dev' = 'prod') {
    this.userId = userId;
    this.accessToken = accessToken;
    this.environment = environment;
    this.url = environment === 'prod' ? BASE_URL : BASE_URL_DEV;
  }

  public async setToken(
    request: StreamerSongListTokenRequest,
  ): Promise<any> {
    const response = await axios.put(
      `${this.url}/token`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return;
  }
}
