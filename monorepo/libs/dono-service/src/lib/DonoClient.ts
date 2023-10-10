import axios from 'axios';
import { DonoDataResponse } from './DonoTypes';
import { getAuthHeaders } from '@hoagie/api-util';

const BASE_URL = 'https://dono.hoagieman.net/api/v1/';

export class DonoClient {
  public async get(
    username: string,
    accessToken: string,
    streamerName: string,
    streamIds?: string[]
  ): Promise<DonoDataResponse> {
    const response = await axios.get(
      `${BASE_URL}${streamerName}?${
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
