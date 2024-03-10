import { SpotifyClient } from '@hoagie/service-clients';

export default class SpotifyGetSongs {
  private clientId: string;
  private clientSecret: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public async getSongs(
    songs: { songKey?: string; artist: string; title: string }[]
  ) {
    const client = new SpotifyClient(this.clientId, this.clientSecret);

    const songInfos = await Promise.all(
      songs.map(async (song) => {
        try {
          console.log({ song });
          if (song) {
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
              return {
                songKey: song.songKey,
                track: songInfo,
                artist,
                analysis,
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
