import axios from 'axios';
import NodeCache from 'node-cache';
import qs from 'qs';

const cache = new NodeCache();

export interface BadWordsResponse {
  bad_words_list: {
    original: string;
    word: string;
  }[];
  status: {
    isError: boolean;
    statusCode: number | string;
    statusMessage: string;
    api: string;
  };
}

export class BadWordsClient {
  private clientSecret;

  private static baseUrl = 'https://api.apilayer.com/bad_words';

  constructor(clientSecret: string) {
    this.clientSecret = clientSecret;
  }

  public async eval(
    fullTitle: string,
    text: string
  ): Promise<BadWordsResponse> {
    let result = cache.get(fullTitle.toLowerCase()) as any;
    if (result) {
      return {
        ...result,
        status: {
          isError: false,
          statusCode: 200,
          statusMessage: 'OK (memcache)',
          api: 'BadWords (cached)',
        },
      };
    }

    const queryString = qs.stringify({
      censor_character: '*',
    });
    const request = `${BadWordsClient.baseUrl}${
      queryString ? `?${queryString}` : ''
    }`;
    const headers = {
      apiKey: `${this.clientSecret}`,
    };
    let response: any = undefined;
    try {
      const data = text
        .replace(/\n/g, ' ')
        .replace(/\(/g, '')
        .replace(/\)/g, '');
      response = await axios.post(request, data, {
        headers,
      });
      result = response?.data as any;
    } catch (err: any) {
      console.error(err);
      return {
        bad_words_list: [],
        status: {
          isError: err.response?.status !== 404,
          statusCode: err.response?.status,
          statusMessage: err.response?.statusText ?? '',
          api: 'BadWords',
        },
      };
    }
    if (result) {
      cache.set(fullTitle.toLowerCase(), result, 600);
    }
    return {
      ...(result ?? {}),
      status: {
        isError: false,
        statusCode: response?.status,
        statusMessage: response?.statusText ?? '',
        api: 'BadWords',
      },
    };
  }
}
