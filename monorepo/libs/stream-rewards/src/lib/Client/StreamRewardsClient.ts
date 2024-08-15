import { getAuthHeaders } from '@hoagie/api-util';
import { GetTokensResponse } from './StreamRewardsTypes';

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
}
