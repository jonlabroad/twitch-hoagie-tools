export class LyricsOvh {
  public static async getLyrics(artist: string, track: string): Promise<string> {
    try {
    const response = await fetch(`https://api.lyrics.ovh/v1/${artist}/${track}`);
    const result = await response.json();
    return result.lyrics;
    } catch (err) {
      console.error(err);
      return "";
    }
  }
}
