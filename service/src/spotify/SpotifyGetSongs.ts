import SpotifyClient from "./SpotifyClient";
import SpotifyDbClient from "./SpotifyDbClient";

export default class SpotifyGetSongs {
    public async getSongs(songs: { artist: string, title: string }[]) {
        const token = await SpotifyDbClient.getToken("hoagieman5000")
        console.log({ token });
        const client = new SpotifyClient();

        const songInfos = await Promise.all(songs.map(async song => {
            const songInfoRaw = await client.getSong(token, song.artist, song.title);
            if (songInfoRaw) {
                const songInfo = songInfoRaw.tracks.items[0];
                const artist = await client.getUrl(token, songInfo.artists[0].href);
                return {
                    track: songInfo,
                    artist,
                }
            }
        }))

        return songInfos ?? [];
    }
}