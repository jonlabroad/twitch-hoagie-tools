import axios from 'axios';
import { DonoDataResponse } from './DonoTypes';
import { getAuthHeaders } from '@hoagie/api-util';

const BASE_URL = 'https://dono.hoagieman.net/api/v1/';
const BASE_URL_DEV = 'https://dono-dev.hoagieman.net/api/v1/';

export class DonoClient {
  environment: "prod" | "dev"
  url: string
  constructor(environment: "prod" | "dev" = "prod") {
    this.environment = environment;
    this.url = environment === "prod" ? BASE_URL : BASE_URL_DEV;
  }

  public async get(
    username: string,
    accessToken: string,
    streamerName: string,
    streamIds?: string[]
  ): Promise<DonoDataResponse> {
    const response = await axios.get(
      `${this.url}${streamerName}?${
        streamIds
          ? streamIds.map((streamId) => `&streamId=${streamId}`).join('')
          : ''
      }`,
      {
        headers: getAuthHeaders(username, accessToken),
      }
    );
    return response.data as DonoDataResponse;
  }
}
