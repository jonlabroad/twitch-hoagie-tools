export class SongEvaluator {
  public static async evaluate(query: string) {
    const geniusClient = new GeniusClient(Config.GeniusClientSecret);
    const geniusSong = await geniusClient.getSong(query);
    const lyrics = geniusSong
      ? await geniusClient.getLyricsFromUrl(geniusSong.url)
      : "";

    //Evaluate the lyrics
    let lyricsEval: any = undefined;
    if (lyrics) {
      const badWordsClient = new BadWordsClient(Config.BadWordsSecret);
      lyricsEval = await badWordsClient.eval(geniusSong.full_title, lyrics);
      if (lyricsEval.status.isError) {
        try {
          // Use the backup
          console.log("Using bad woards backup!");
          const hoagieClient = new HoagieBadWordsClient();
          const result = hoagieClient.eval(lyrics);
          console.log({ result });
          lyricsEval = result;
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
}
