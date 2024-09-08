import { DBResponseCache } from '@hoagie/api-util';
import { SpotifyClient } from '@hoagie/service-clients';
import { createDocClient } from './util/DBUtil';

export interface SongInfo {
  songKey?: string;
  track: any;
  artist: any;
  analysis: any;
}

export default class SpotifyGetSongs {
  private clientId: string;
  private clientSecret: string;
  private tableName: string;

  constructor(clientId: string, clientSecret: string, tableName: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tableName = tableName;
  }

  public async getSongs(
    songs: { songKey?: string; artist: string; title: string }[],
    version: string
  ) {
    const client = new SpotifyClient(this.clientId, this.clientSecret);
    const dbClient = createDocClient();
    const cacheClient = new DBResponseCache(dbClient, "songlookup", this.tableName);

    const songInfos = await Promise.all(
      songs.map(async (song) => {
        try {
          console.log({ song });
          if (song) {
            const cacheKey = `${song.artist}-${song.title}`;
            const cached = await cacheClient.get(cacheKey, version);
            if (cached) {
              console.log(`Cache hit for ${cacheKey}`);
              console.log({ cached });
              return {
                songKey: song.songKey,
                ...cached
              };
            }

            const songInfoRaw = await client.getSong(song.artist, song.title);
            if (songInfoRaw) {
              const songInfo = songInfoRaw.tracks.items[0];
              const artist = await client.getUrl(songInfo.artists[0].href);
              const analysis = await client.getAudioAnalysis(songInfo.id);
              if (analysis) {
                // @ts-ignore
                delete analysis.meta;
                // @ts-ignore
                delete analysis.beats;
                // @ts-ignore
                delete analysis.bars;
                // @ts-ignore
                delete analysis.sections;
                // @ts-ignore
                delete analysis.segments;
                // @ts-ignore
                delete analysis.tatums;
              }
              const songInfoUnkeyed = {
                track: songInfo,
                artist,
                analysis,
              };
              await cacheClient.set(cacheKey, songInfoUnkeyed, version);
              return {
                ...songInfoUnkeyed,
                songKey: song.songKey,
              };
            }
          }
          return {
            songKey: song.songKey,
            track: undefined,
            artist: undefined,
            analysis: undefined,
          };
        } catch (err) {
          console.error(err);
          return {
            songKey: song.songKey,
            track: undefined,
            artist: undefined,
            analysis: undefined,
          };
        }
      })
    );

    return songInfos ?? [];
  }
}
