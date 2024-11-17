import { getAuthHeaders, TokenCategory } from '@hoagie/api-util';
import axios from 'axios';
import { UserData } from './ConfigDBClient';
import { AccessTokenInfo } from '../AccessTokenInfo';
import { ValidationResult } from '@hoagie/config-service';
import { CreateSubscriptionInput } from '@hoagie/service-clients';

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

  public async getMods(
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

  public async addMod(
    streamerId: string,
    modId: string,
  ): Promise<void> {
    const response = await axios.put(
      `${this.url}${streamerId}/mods/${modId}`,
      {},
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
  }

  public async deleteMod(
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

  public async getUserData(
    userId: string,
  ): Promise<UserData> {
    const response = await axios.get(
      `${this.url}userdata`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return response.data as UserData;
  }

  public async getSystemStatus(
  ): Promise<any> {
    const response = await axios.get(
      `${this.url}system/status`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return response.data;
  }

  public async getTwitchEventSubSubscriptions(): Promise<any> {
    const response = await axios.get(
      `${this.url}twitch/subscriptions`,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return response.data;
  }

  public async createTwitchEventSubSubscriptions(subscriptions: CreateSubscriptionInput[]): Promise<any> {
    const response = await axios.post(
      `${this.url}twitch/subscriptions`,
      subscriptions,
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return response.data;
  }

  public async validateAccessToken(userId: string, category: TokenCategory): Promise<ValidationResult> {
    const response = await axios.post(
      `${this.url}access/twitchtoken/validate`,
      {
        twitchUserId: userId,
        type: category,
      },
      {
        headers: getAuthHeaders(this.userId, this.accessToken),
      }
    );
    return response.data;
  }
}
