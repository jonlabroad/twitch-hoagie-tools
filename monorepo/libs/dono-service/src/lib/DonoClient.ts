import axios from 'axios';
import { DonoDataResponse } from './DonoTypes';
import { getAuthHeaders } from '@hoagie/api-util';

const BASE_URL = 'https://dono.hoagieman.net/api/v1/';
const BASE_URL_DEV = 'https://dono-new-dev.hoagieman.net/api/v1/';

export class DonoClient {
  environment: "prod" | "dev"
  url: string
  constructor(environment: "prod" | "dev" = "prod") {
    this.environment = environment;
    this.url = environment === "prod" ? BASE_URL : BASE_URL_DEV;
  }

  public async get(
    userId: string,
    accessToken: string,
    streamerId: string,
    streamIds?: string[]
  ): Promise<DonoDataResponse> {
    const response = await axios.get(
      `${this.url}${streamerId}?${
        streamIds
          ? streamIds.map((streamId) => `&streamId=${streamId}`).join('')
          : ''
      }`,
      {
        headers: getAuthHeaders(userId, accessToken),
      }
    );
    return response.data as DonoDataResponse;
  }
}
