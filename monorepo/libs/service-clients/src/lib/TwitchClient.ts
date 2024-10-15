import axios from 'axios';
import {
  ChannelScheduleResponse,
  CreateSubscriptionInput,
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

export interface TwitchAccessToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: string;
}

export class TwitchClient {
  private options: TwitchClientOptions;

  private userIdCache: Record<string, Promise<any> | undefined> = {};

  authToken?: TwitchAccessToken;

  constructor(options: TwitchClientOptions) {
    this.options = options;
  }

  async getUserId(username: string): Promise<string | undefined> {
    const url = `https://api.twitch.tv/helix/users?login=${username}`;
    let request = this.userIdCache[username.toLowerCase()];
    if (!request) {
      request = (async () => {
        return this.get<any>(url);
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
    subscription: CreateSubscriptionInput,
    callbackHost: string,
    secret: string,
  ) {
    const userId = subscription.userId || await this.getUserId(subscription.username ?? "");
    if (!userId) {
      return;
    }

    const url = 'https://api.twitch.tv/helix/eventsub/subscriptions';
    console.log({ url });
    const data = {
      type: subscription.type,
      version: '1',
      condition: subscription.condition,
      transport: {
        method: 'webhook',
        callback: `${callbackHost}/api/twitchcallback`,
        secret,
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

  async getStreamsByUserId(userIds: string[]): Promise<StreamData[]> {
    const data = await this.get<Paginated<StreamData[]>>(
      `https://api.twitch.tv/helix/streams?${userIds
        .map((u) => `user_id=${u}`)
        .join('&')}`
    );
    return data?.data ?? [];
  }

  // Confirm that this Twitch user is who they say they are
  public static async validateUserIdAndToken(
    userId: string,
    userToken: string
  ): Promise<{
    validated: boolean;
    validatedSession: ValidatedSession | null
    statusCode: number | undefined
    message: string | undefined
  }> {
    try {
      console.log('https://id.twitch.tv/oauth2/validate');
      const response = await axios.get<ValidatedSession>(
        'https://id.twitch.tv/oauth2/validate',
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      return {
        validated: response.status === 200 && userId === response.data.user_id,
        validatedSession: response.data,
        statusCode: response.status,
        message: "OK"
      };
    } catch (err: any) {
      console.error(err.message, err);
      return {
        statusCode: err.response?.status,
        validated: false,
        validatedSession: null,
        message: err.response?.message,
      };
    }
  }

  public async refreshToken(refreshToken: string): Promise<TwitchAccessToken | undefined> {
    try {
      const response = await axios.post<TwitchAccessToken>(
        `https://id.twitch.tv/oauth2/token?client_id=${this.options.clientId}&client_secret=${this.options.serviceAuth?.clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`
      );
      return response.data;
    } catch (err: any) {
      console.error(err.message);
      return undefined;
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

  async getUserDataById(userIds: string[]): Promise<UserData[]> {
    if (userIds?.length > 0) {
      const url = `https://api.twitch.tv/helix/users?${userIds
        .map((u) => `id=${u}`)
        .join('&')}`;
      const response = await this.get<{ data: UserData[] }>(url);
      return response?.data ?? [];
    }
    return [];
  }

  async getUserDataByToken(accessToken: string): Promise<UserData | null> {
    const url = 'https://api.twitch.tv/helix/users';
    const response = await this.get<{ data: UserData[] }>(url, accessToken);
    return response?.data[0] ?? null;
  }

  async getUsersData(userLogins: string[], userIds: string[] = []) {
    let url = `https://api.twitch.tv/helix/users?${userLogins
      .map((u) => `login=${u}`)
      .join('&')}`;
    url = url.concat(userLogins.length > 0 ? '&' : '' + userIds.map((u) => `id=${u}`).join('&'));
    const response = await this.get<{ data: UserData[] }>(url);
    return response?.data;
  }

  async getUserData(userLogin: string) {
    const datas = await this.getUsersData([userLogin]);
    return datas?.[0];
  }

  public async sendChatMessage(channelId: string, message: string, senderId: string, accessToken: string) {
    const url = `https://api.twitch.tv/helix/chat/messages`;
    const response = await this.post(url, {
      broadcaster_id: channelId,
      sender_id: senderId,
      message
    }, accessToken);
    console.log({ sendMessageResponse: response });
    return response;
  }

  public async sendWhisperMessage(recipientId: string, message: string, senderId: string) {
    const url = `https://api.twitch.tv/helix/whispers`;
    const response = await axios.post(url, {
      message,
      to_user_id: recipientId,
      from_user_id: senderId
    },
    {
      headers: await this.getAuthHeaders(),
    });
    console.log({ sendWhisperResponse: response });
    return response;
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

  public async getTokenFromAuthorizationCode(authorizationCode: string, redirectUri: string): Promise<TwitchAccessToken | null> {
    try {
      if (this.options.serviceAuth) {
        const url = `https://id.twitch.tv/oauth2/token?client_id=${this.options.clientId}&client_secret=${this.options.serviceAuth?.clientSecret}&code=${authorizationCode}&grant_type=authorization_code&redirect_uri=${redirectUri}`;
        const response = await axios.post(url);

        if (response.status === 200 && response.data) {
          const token = response.data;
          return token;
        } else {
          console.error(
            'Failed to get token from auth code',
            response.status,
            response.data
          );
        }
      }
    } catch (err: any) {
      console.error(err.message);
      return null;
    }
    return null;
  }

  public async getSchedule(broadcasterId: string): Promise<ChannelScheduleResponse | null | undefined> {
    const url = `https://api.twitch.tv/helix/schedule?broadcaster_id=${broadcasterId}`;
    return this.get(url);
  }

  private async getAuthHeaders(accessToken?: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    headers['Client-ID'] = this.options.clientId;
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else if (this.options.serviceAuth) {
      await this.getServiceAuthToken();
      headers['Authorization'] = `Bearer ${this.authToken?.access_token}`;
    } else if (this.options.clientAuth) {
      headers[
        'Authorization'
      ] = `Bearer ${this.options.clientAuth.accessToken}`;
    }
    return headers;
  }

  private async get<T>(url: string, accessToken?: string): Promise<T | null | undefined> {
    try {
      const response = await axios.get<any>(url, {
        headers: await this.getAuthHeaders(accessToken),
      });
      return response.data ?? null;
    } catch (err: any) {
      console.error(err);
      return null;
    }
  }

  private async post(url: string, data?: Object, accessToken?: string) {
    try {
      const response = await axios.post<any>(
        url,
        data ?? JSON.stringify(data, null, 2),
        {
          headers: await this.getAuthHeaders(accessToken),
        }
      );
      return response.data ?? null;
    } catch (err: any) {
      console.error(err);
      return null;
    }
  }
}
