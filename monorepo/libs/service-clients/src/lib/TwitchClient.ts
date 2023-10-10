import axios from 'axios';
import {
    Game,
    Paginated,
  StreamData,
  TwitchSubscription,
  UserData,
  UserFollows,
  UsersFollows,
  ValidatedSession,
} from './TwitchClientTypes';

// const subscriptionCallbackHost = process.env.STAGE === "prod" ? "https://hoagietools-svc-prod.hoagieman.net" : "https://hoagietools-svc-development.hoagieman.net";

export interface TwitchClientOptions {
  clientId: string;
  clientAuth?: {
    accessToken: string;
  };
  serviceAuth?: {
    clientSecret: string;
  };
}

export class TwitchClient {
  private options: TwitchClientOptions;

  private userIdCache: Record<string, Promise<any> | undefined> = {};

  authToken?: {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  constructor(options: TwitchClientOptions) {
    this.options = options;
  }

  async getUserId(username: string): Promise<string | undefined> {
    const url = `https://api.twitch.tv/helix/users?login=${username}`;
    let request = this.userIdCache[username.toLowerCase()];
    if (!request) {
      request = (async () => {
        return this.get<any>(
          `https://api.twitch.tv/helix/users?login=${username}`
        );
      })();

      this.userIdCache[username.toLowerCase()] = request;
    }

    const response = await request;
    if (response?.data && response?.data?.length === 1) {
      return response.data[0].id;
    }
    return undefined;
  }

  public async listSubscriptions() {
    const url = 'https://api.twitch.tv/helix/eventsub/subscriptions';
    const response = await this.get<any>(url);
    return response as {
      data: TwitchSubscription[];
      total: number;
      total_cost: number;
      max_total_cost: number;
      pagination: any;
    };
  }

  public async createSubscription(
    username: string,
    type: string,
    condition: Record<string, string>,
    subscriptionCallbackHost: string,
    subscriptionSecret: string
  ) {
    const userId = await this.getUserId(username);
    if (!userId) {
      return;
    }

    const url = 'https://api.twitch.tv/helix/eventsub/subscriptions';
    console.log({ url });
    const data = {
      type,
      version: '1',
      condition,
      transport: {
        method: 'webhook',
        callback: `${subscriptionCallbackHost}/api/twitchcallback`,
        secret: subscriptionSecret,
      },
    };
    const config = {
      headers: {
        ...(await this.getAuthHeaders()),
        'Content-Type': 'application/json',
      },
    };
    const response = await this.post(url, data);
    return response.data;
  }

  async deleteSubscription(id: string): Promise<any> {
    const url = `https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`;
    const response = await axios.delete(url, {
      headers: await this.getAuthHeaders(),
    });
    return response.data;
  }

  async getGame(name: string): Promise<Game | undefined> {
    const data = await this.get<{ data: Game[]}>(`https://api.twitch.tv/helix/games?name=${name}`);
    return data?.data?.[0];
}

async getStreamsByGame(gameId: string): Promise<StreamData[]> {
    let after = undefined;
    const channels: StreamData[] = [];
    do {
        const page = await this.get(`https://api.twitch.tv/helix/streams?game_id=${gameId}&first=100${after ? `&after=${after}` : ``}`) as Paginated<StreamData[]>;
        channels.push(...page.data);
        after = page.pagination?.cursor;
    } while (after);
    return channels;
}

  async getUserFollows(userId: string): Promise<UserFollows[]> {
    let after = undefined;
    const follows: UserFollows[] = [];
    do {
        const followData: Paginated<UserFollows[]> | undefined | null = await this.get<Paginated<UserFollows[]>>(`https://api.twitch.tv/helix/channels/followed?user_id=${userId}&first=100${after ? `&after=${after}` : ``}`);
        if (followData) {
            follows.push(...followData.data);
            after = followData.pagination?.cursor;
        } else {
            after = null;
        }
    } while (after);
    return follows;
}

  async getBroadcasterIdLiveStream(userId: string) {
    const url = `https://api.twitch.tv/helix/streams?user_id=${userId}&type=live`;
    console.log({ url });
    const response = await this.get<{ data: StreamData[] }>(url);
    return response?.data?.[0];
  }

  async getBroadcasterLoginLiveStream(userLogin: string): Promise<StreamData> {
    const url = `https://api.twitch.tv/helix/streams?user_login=${userLogin}&type=live`;
    console.log({ url });
    const response = await axios.get<any>(url, {
      headers: await this.getAuthHeaders(),
    });
    console.log({ data: response.data });
    return response.data.data[0];
  }

  async getStreamsByUsernames(usernames: string[]): Promise<StreamData[]> {
    const data = await this.get<Paginated<StreamData[]>>(
      `https://api.twitch.tv/helix/streams?${usernames
        .map((u) => `user_login=${u}`)
        .join('&')}`
    );
    return data?.data ?? [];
  }

  // Confirm that this Twitch user is who they say they are
  public static async validateUserIdAndToken(
    userName: string,
    userToken: string
  ) {
    try {
      console.log('https://id.twitch.tv/oauth2/validate');
      const response = await axios.get<any>(
        'https://id.twitch.tv/oauth2/validate',
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      return {
        validated: response.status === 200 && userName === response.data.login,
        validatedSession: response.data,
      };
    } catch (err: any) {
      console.error(err.message, err);
      return {
        validated: false,
        validatedSession: null,
      };
    }
  }

  // Validate a session given only a token
  public static async validateSession(token: string): Promise<{
    validatedSession: ValidatedSession | undefined;
    validated: boolean;
  }> {
    const response = await axios.get('https://id.twitch.tv/oauth2/validate', {
      headers: {
        Authorization: `OAuth ${token}`,
      },
    });
    return {
      validated: response.status === 200,
      validatedSession: response.data,
    };
  }

  async getUsersData(userLogins: string[]) {
    const url = `https://api.twitch.tv/helix/users?${userLogins
      .map((u) => `login=${u}`)
      .join('&')}`;
    const response = await this.get<{ data: UserData[] }>(url);
    return response?.data ?? [];
  }

  async getUserData(userLogin: string) {
    const datas = await this.getUsersData([userLogin]);
    return datas[0];
  }

  private async getServiceAuthToken() {
    if (!this.authToken && this.options.serviceAuth) {
      const response = await axios.post(
        `https://id.twitch.tv/oauth2/token?client_id=${this.options.clientId}&client_secret=${this.options.serviceAuth.clientSecret}&grant_type=client_credentials`
      );
      if (response.status === 200 && response.data) {
        this.authToken = response.data;
      } else {
        console.error(
          'Failed to get service auth token',
          response.status,
          response.data
        );
      }
    }
    return this.authToken;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    headers['Client-ID'] = this.options.clientId;
    if (this.options.serviceAuth) {
      await this.getServiceAuthToken();
      headers['Authorization'] = `Bearer ${this.authToken?.access_token}`;
    } else if (this.options.clientAuth) {
      headers[
        'Authorization'
      ] = `Bearer ${this.options.clientAuth.accessToken}`;
    }
    return headers;
  }

  private async get<T>(url: string): Promise<T | null | undefined> {
    try {
      const response = await axios.get<any>(url, {
        headers: await this.getAuthHeaders(),
      });
      return response.data ?? null;
    } catch (err: any) {
      console.error(err);
      return null;
    }
  }

  private async post(url: string, data?: Object) {
    try {
      const response = await axios.post<any>(
        url,
        data ?? JSON.stringify(data, null, 2),
        {
          headers: await this.getAuthHeaders(),
        }
      );
      return response.data ?? null;
    } catch (err: any) {
      console.error(err);
      return null;
    }
  }
}
