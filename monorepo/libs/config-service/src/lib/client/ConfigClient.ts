import { getAuthHeaders } from '@hoagie/api-util';
import axios from 'axios';

const BASE_URL = 'https://config.hoagieman.net/api/v1/';
const BASE_URL_DEV = 'https://config-dev.hoagieman.net/api/v1/';

export interface ModsResponse {
  mods: string[];
}

export class ConfigClient {
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

  public async get(
    streamerId: string,
  ): Promise<ModsResponse> {
    const response = await axios.get(
      `${this.url}${streamerId}/mods`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return response.data as ModsResponse;
  }

  public async add(
    streamerId: string,
    modId: string,
  ): Promise<void> {
    const response = await axios.put(
      `${this.url}${streamerId}/mods/${modId}`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
  }

  public async delete(
    streamerId: string,
    modId: string,
  ): Promise<void> {
    const response = await axios.delete(
      `${this.url}${streamerId}/mods/${modId}`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
  }
}
