/*
{
  "data": [
    {
      "id": 387691861,
      "readable": true,
      "title": "Want It Back",
      "title_short": "Want It Back",
      "link": "http://www.deezer.com/track/387691861",
      "duration": 229,
      "rank": 21463,
      "explicit_lyrics": false,
      "explicit_content_lyrics": 0,
      "explicit_content_cover": 2,
      "preview": "http://cdnt-preview.dzcdn.net/api/1/1/b/c/6/0/bc6289b4c84e0f1d1241e40ceb5d4915.mp3?hdnea=exp=1741230108~acl=/api/1/1/b/c/6/0/bc6289b4c84e0f1d1241e40ceb5d4915.mp3*~data=user_id=0,application_id=42~hmac=97c0fd39449177fcafab67352f672098ede3b0d78beb2299c66f4aee5e6fb7a7",
      "md5_image": "48ae26b1d898c9825d1c0ef9b9e9e49a",
      "artist": {
        "id": 132246,
        "name": "Amanda Palmer",
        "link": "http://www.deezer.com/artist/132246",
        "picture": "http://api.deezer.com/artist/132246/image",
        "picture_small": "http://cdn-images.dzcdn.net/images/artist/34721182ee510672cd10b25aba867dba/56x56-000000-80-0-0.jpg",
        "picture_medium": "http://cdn-images.dzcdn.net/images/artist/34721182ee510672cd10b25aba867dba/250x250-000000-80-0-0.jpg",
        "picture_big": "http://cdn-images.dzcdn.net/images/artist/34721182ee510672cd10b25aba867dba/500x500-000000-80-0-0.jpg",
        "picture_xl": "http://cdn-images.dzcdn.net/images/artist/34721182ee510672cd10b25aba867dba/1000x1000-000000-80-0-0.jpg",
        "tracklist": "http://api.deezer.com/artist/132246/top?limit=50",
        "type": "artist"
      },
      "album": {
        "id": 45256861,
        "title": "Piano Is Evil",
        "cover": "http://api.deezer.com/album/45256861/image",
        "cover_small": "http://cdn-images.dzcdn.net/images/cover/48ae26b1d898c9825d1c0ef9b9e9e49a/56x56-000000-80-0-0.jpg",
        "cover_medium": "http://cdn-images.dzcdn.net/images/cover/48ae26b1d898c9825d1c0ef9b9e9e49a/250x250-000000-80-0-0.jpg",
        "cover_big": "http://cdn-images.dzcdn.net/images/cover/48ae26b1d898c9825d1c0ef9b9e9e49a/500x500-000000-80-0-0.jpg",
        "cover_xl": "http://cdn-images.dzcdn.net/images/cover/48ae26b1d898c9825d1c0ef9b9e9e49a/1000x1000-000000-80-0-0.jpg",
        "md5_image": "48ae26b1d898c9825d1c0ef9b9e9e49a",
        "tracklist": "http://api.deezer.com/album/45256861/tracks",
        "type": "album"
      },
      "type": "track"
    }
  ],
  "total": 1
}
*/

export interface DeezerSearchResponse {
  data: DeezerSong[];
}

export interface DeezerSong {
  id: number;
  readable: boolean;
  title: string;
  title_short: string;
  link: string;
  duration: number;
  rank: number;
  explicit_lyrics: boolean;
  explicit_content_lyrics: number;
  explicit_content_cover: number;
  preview: string;
  md5_image: string;
  artist: {
    id: number;
    name: string;
    link: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
    picture_xl: string;
    tracklist: string;
    type: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
    md5_image: string;
    tracklist: string;
    type: string;
  };
  type: string;
}

export class DeezerClient {
  public static async search(term: string): Promise<DeezerSearchResponse | null> {
    try {
      const response = await fetch(`https://api.deezer.com/search?q=${term}&limit=15&output=json`);
      const result = await response.json();
      return result;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}
