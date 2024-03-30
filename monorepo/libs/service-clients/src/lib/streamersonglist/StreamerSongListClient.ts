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

  public async getSong(streamerId: string, songId: string): Promise<StreamerSongListSong | undefined> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/streamers/${streamerId}/songs/${songId}`);
      return response.json();
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
}
