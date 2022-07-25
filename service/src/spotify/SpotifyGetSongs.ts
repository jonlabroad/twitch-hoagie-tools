import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders";
import SpotifyClient from "./SpotifyClient";
import SpotifyGetToken from "./SpotifyGetToken";

export default class SpotifyGetSongs {
    public async getSongs(songs: { songKey: string, artist: string, title: string }[]) {
        const token = await SpotifyGetToken.getToken("hoagieman5000");

        if (!token) {
            console.error(`Unable to get Spotify token`)
            return [];
        }

        const client = new SpotifyClient();

        const songInfos = await Promise.all(songs.map(async song => {
            try {
                if (song) {
                    const songInfoRaw = await client.getSong(token?.access_token, song.artist, song.title);
                    if (songInfoRaw) {
                        const songInfo = songInfoRaw.tracks.items[0];
                        const artist = await client.getUrl(token?.access_token, songInfo.artists[0].href);
                        const analysis = await client.getAudioAnalysis(token?.access_token, songInfo.id);
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
                        }
                    }
                }
                return {
                    songKey: song.songKey,
                    track: undefined,
                    artist: undefined,
                    analysis: undefined,
                }
            } catch (err) {
                console.error(err);
                return {
                    songKey: song.songKey,
                    track: undefined,
                    artist: undefined,
                    analysis: undefined,
                }
            }
        }))

        return songInfos ?? [];
    }
}