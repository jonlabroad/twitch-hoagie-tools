import axios from 'axios';

export interface SpotifyProfile {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string | null;
    total: number;
  };
  href: string;
  id: string;
  images: string[];
  product: string;
  type: string;
  uri: string;
}

export interface SpotifyPlaylist {
  collaborative: boolean;
  description: string;
  external_urls: string[];
  followers: string[];
  href: string;
  id: string;
  images: string[];
  name: string;
  owner: string[];
  primary_color: string;
  public: boolean;
  snapshot_id: string;
  tracks: any[];
  type: string;
  uri: string;
}

export class SpotifyPlaylistClient {
  private readonly userToken: string;

  public constructor(userToken: string) {
    this.userToken = userToken;
  }

 public async getUserProfile() {
    const url = 'https://api.spotify.com/v1/me';
    console.log(url);
    const response = await axios.get<SpotifyProfile>(url, {
      headers: {
        Authorization: `Bearer ${this.userToken}`,
      },
    });
    return response.data;
  }

  public async getUserId() {
    const profile = await this.getUserProfile();
    return profile.id;
  }

  public async createPlaylist(
    userId: string,
    playlistName: string
  ) {
    const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
    console.log(url);
    const response = await axios.post<any, any>(
      url,
      {
        name: playlistName,
        description: 'Streamersonglist Playlist',
        public: true,
      },
      {
        headers: {
          Authorization: `Bearer ${this.userToken}`,
        },
      }
    );
    console.log(response.data);
    return response.data as SpotifyPlaylist;
  }

  public async getPlaylist(playlistId: string) {
    const uri = `https://api.spotify.com/v1/playlists/${playlistId}`;
    const response = await axios.get<SpotifyPlaylist>(uri, {
      headers: {
        Authorization: `Bearer ${this.userToken}`,
      },
    });
    return response.data;
  }

  public async addPlaylistTracks(
    playlistId: string,
    trackUris: string[]
  ) {
    const url = `	https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${trackUris.join(
      ','
    )}`;
    console.log(url);
    const response = await axios.post<any, any>(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.userToken}`,
        },
      }
    );
    return response.data;
  }

  public async getUrl(url: string) {
    console.log(url);
    const response = await axios.get<any, any>(url, {
      headers: {
        Authorization: `Bearer ${this.userToken}`,
      },
    });
    return response.data;
  }
}
