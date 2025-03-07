import { BadWordsClient, HoagieBadWordsClient, GeniusClient, DeezerClient, LyricsOvh, DeezerSong } from "@hoagie/service-clients";

export class SongEvaluator {
  private geniusSecret: string;
  private badWordsSecret: string;

  constructor(geniusSecret: string, badWordsSecret: string) {
    this.geniusSecret = geniusSecret;
    this.badWordsSecret = badWordsSecret;
  }

  public async evaluate(query: string) {
    console.log({ searchingForSong: query });

    //Evaluate the lyrics
    let lyricsEval: any = undefined;
    let lyrics: string = "";
    let song: DeezerSong | null = null;
    const deezerSearch = await DeezerClient.search(query);
    if (deezerSearch && deezerSearch?.data && deezerSearch.data.length > 0) {
      const deezerSong = deezerSearch.data[0];
      console.log({ deezerSong });
      song = deezerSong;
      const artist = deezerSong.artist.name;
      const track = deezerSong.title;
      console.log({ artist, track });
      lyrics = await LyricsOvh.getLyrics(artist, track);
      if (lyrics) {
        const evalCacheKey = `${artist}-${track}`;
        if (evalCacheKey) {
          const badWordsClient = new BadWordsClient(this.badWordsSecret);
          //lyricsEval = await badWordsClient.eval(geniusSong.full_title, lyrics);
          lyricsEval = await badWordsClient.eval(evalCacheKey, lyrics);
          if (lyricsEval.status.isError) {
            try {
              // Use the backup
              console.log("Using bad words backup!");
              const hoagieClient = new HoagieBadWordsClient();
              const result = hoagieClient.eval(lyrics);
              lyricsEval = result;
            } catch (err) {
              console.error(err);
            }
          }
        }
      }
    }

    return {
      lyricsEval,
      lyrics,
      song,
    };
  }
}
