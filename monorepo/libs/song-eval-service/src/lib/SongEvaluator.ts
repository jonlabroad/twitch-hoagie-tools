import { BadWordsClient, HoagieBadWordsClient, GeniusClient } from "@hoagie/service-clients";

export class SongEvaluator {
  private geniusSecret: string;
  private badWordsSecret: string;

  constructor(geniusSecret: string, badWordsSecret: string) {
    this.geniusSecret = geniusSecret;
    this.badWordsSecret = badWordsSecret;
  }

  public async evaluate(query: string) {
    console.log({ searchingForSong: query });
    const geniusClient = new GeniusClient(this.geniusSecret);
    const geniusSong = await geniusClient.getSong(query);
    let lyrics = "";
    try {
      lyrics = geniusSong
        ? await geniusClient.getLyricsFromUrl(geniusSong.url)
        : "";
    } catch (err: any) {
      console.error(`Unable to get Genius lyrics (${geniusSong.url}): ${err.message}`);
    }

    //Evaluate the lyrics
    let lyricsEval: any = undefined;
    if (lyrics) {
      const badWordsClient = new BadWordsClient(this.badWordsSecret);
      lyricsEval = await badWordsClient.eval(geniusSong.full_title, lyrics);
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

    return {
      lyricsEval,
      lyrics,
      song: geniusSong,
    };
  }
}
