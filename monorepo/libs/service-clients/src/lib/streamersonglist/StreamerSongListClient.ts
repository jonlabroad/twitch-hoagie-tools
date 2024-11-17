export interface StreamerSongListSong {
  id: number;
  title: string;
  artist: string;
  createdAt: string;
  active: boolean;
  lastActivation: string;
  comment: string;
  tabs: string;
  lyrics: string;
  chords: string;
  capo: string;
  bypassRequestLimits: boolean;
  minAmount: number;
  lastPlayed: string;
  timesPlayed: number;
  numQueued: number;
  attributeIds: number[];
}

export class StreamerSongListClient {
  private baseUrl = "https://api.streamersonglist.com";
  private authToken: string | undefined;

  constructor(authToken?: string) {
    this.authToken = authToken;
  }

  public getSslUserId = async (twitchUsername: string): Promise<number | undefined> => {
    // https://api.streamersonglist.com/v1/streamers/hoagieman5000?platform=twitch&isUsername=true
    try {
      const url = `${this.baseUrl}/v1/streamers/${twitchUsername.toLowerCase()}?platform=twitch&isUsername=true`;
      console.log({ url });
      const response = await fetch(url);
      console.log({ response });
      const data = await response.json() as { id: number }; // There is a lot more information here
      return data.id;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  public async getSong(streamerId: string, songId: string): Promise<StreamerSongListSong | undefined> {
    try {
      const url = `${this.baseUrl}/v1/streamers/${streamerId}/songs/${songId}`;
      console.log({ url });
      const response = await fetch(url);
      console.log({ response });
      return response.json();
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  public async nonlistSongRequest(sslStreamerId: string | number, requesterLogin: string, name: string, note: string = ""): Promise<boolean> {
    // https://api.streamersonglist.com/v1/streamers/8764/queue
    try {
      const url = `${this.baseUrl}/v1/streamers/${sslStreamerId}/queue`;
      const body = {
        nonlistSong: name,
        requests: [{"amount": 0,"name": requesterLogin}],
        note,
      };
      const headers = {
        Authorization: `Bearer ${this.authToken}`,
        ['Content-Type']: "application/json",
        ['X-Ssl-User-types']: `mod`,
      };
      console.log({ url, headers });
      console.log(body);
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers,
      });
      console.log({ response });
      return response.ok;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}
