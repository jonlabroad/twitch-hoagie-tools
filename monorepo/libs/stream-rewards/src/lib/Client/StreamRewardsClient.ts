import { getAuthHeaders } from '@hoagie/api-util';
import { GetBroadcasterRedemptionsResponse, GetTokensResponse } from './StreamRewardsTypes';
import { CustomReward } from '@hoagie/service-clients';
import { IStreamRewardConfig } from '../IStreamReward';

const baseUrl = 'https://rewards.hoagieman.net/api';

interface Options {
  streamId: string;
  userId?: string;
}

interface AuthParams {
  userId: string;
  accessToken: string;
}

export class StreamRewardsClient {
  public async getTokens(
    options: Options,
    auth: AuthParams,
  ): Promise<GetTokensResponse> {
    const url = `${baseUrl}/v1/${options.streamId}/tokens?${
      options.userId ? `&userId=${options.userId}` : ''
    }`;
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(auth.userId, auth.accessToken),
      },
    });
    return await response.json() as GetTokensResponse;
  }

  public async getRedemptions(
    options: Options,
    auth: AuthParams,
  ): Promise<GetTokensResponse> {
    const url = `${baseUrl}/v1/${options.streamId}/redemptions?${
      options.userId ? `&userId=${options.userId}` : ''
    }`;
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(auth.userId, auth.accessToken),
      },
    });
    return await response.json() as GetTokensResponse;
  }

  public async getBroadcasterRedemptions(
    options: Options,
    auth: AuthParams,
  ) {
    const url = `${baseUrl}/v1/${options.streamId}/broadcasterredemptions`;
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(auth.userId, auth.accessToken),
      },
    });
    return (await response.json() ?? []) as GetBroadcasterRedemptionsResponse;
  }

  public async getRewardsConfig(
    options: Options,
    auth: AuthParams,
  ): Promise<IStreamRewardConfig | undefined> {
    const url = `${baseUrl}/v1/${options.streamId}/config`;
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(auth.userId, auth.accessToken),
      },
    });
    return await response.json() as IStreamRewardConfig | undefined;
  }

  public async saveRewardsConfig(
    config: IStreamRewardConfig,
    options: Options,
    auth: AuthParams,
  ): Promise<any> {
    const url = `${baseUrl}/v1/${options.streamId}/config`;
    const response = await fetch(url.toString(), {
      method: 'POST',
      body: JSON.stringify(config),
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(auth.userId, auth.accessToken),
      },
    });
    return await response.json() as any;
  }
}
