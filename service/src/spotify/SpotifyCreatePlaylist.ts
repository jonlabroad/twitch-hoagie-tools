import levenshtein from "js-levenshtein";
import Config from "../Config";
import StreamerSongListClient, { StreamerSongListSong } from "../StreamerSongList/StreamerSongListClient";
import SpotifyClient, { SearchResponse, SpotifyPlaylist, SpotifySong } from "./SpotifyClient";
import SpotifyDbClient from "./SpotifyDbClient";

export default class SpotifyCreatePlaylist {
    requestingUsername: string;
    streamerName: string;

    constructor(streamerName: string, requestingUsername: string) {
        this.streamerName = streamerName;
        this.requestingUsername = requestingUsername;
    }

    public async create() {
        const sslClient = new StreamerSongListClient();

        console.log("Getting songs");
        const songlistSongs = await sslClient.getSongListSongs(this.streamerName);
        const spotifyToken = await SpotifyDbClient.getToken(this.requestingUsername) as string;

        const spotifyClient = new SpotifyClient();
        const userId = await spotifyClient.getUserId(spotifyToken);

        const spotifySongs = await this.getSpotifySongs(spotifyToken, songlistSongs);

        const playlist = await this.createPlaylist(userId, spotifyToken);

        await this.addTracksToPlaylist(spotifyToken, spotifySongs, playlist);
    }

    private async getSpotifySongs(spotifyToken: string, streamerSonglistSongs: StreamerSongListSong[]): Promise<SpotifySong[]> {
        const client = new SpotifyClient();
        const spotifySongs: SpotifySong[] = [];
        for (let song of streamerSonglistSongs) {
            console.log(`Finding ${song.artist} - ${song.title}`);
            const searchResult = await client.getSong(spotifyToken, song.artist.replace("Aly, The Songery", "The Songery"), song.title);
            if (searchResult) {
                const spotifySong = this.selectSongFromResults(searchResult, song);
                if (spotifySong) {
                    spotifySongs.push(spotifySong);
                }
            }
        }
        return spotifySongs;
    }

    private async createPlaylist(userId: string, spotifyToken: string) {
        const spotifyClient = new SpotifyClient();
        let playlistId = await SpotifyDbClient.getPlaylist(this.streamerName);
        console.log({ playlistId });
        let playlist: SpotifyPlaylist | undefined;
        if (!playlistId) {
            console.log("Creating playlist");
            playlist = await spotifyClient.createPlaylist(spotifyToken, userId, `${this.streamerName} Twitch Songlist${Config.stage === "prod" ? "" : "_dev"}`);
            console.log({ playlist });
            if (playlist?.id) {
                await SpotifyDbClient.setPlaylist(this.streamerName, playlist.id);
                playlistId = playlist.id;
            }
        } else {
            playlist = await spotifyClient.getPlaylist(spotifyToken, playlistId);
        }
        return playlist;
    }

    private async addTracksToPlaylist(spotifyToken: string, spotifySongs: SpotifySong[], playlist: SpotifyPlaylist) {
        const spotifyClient = new SpotifyClient();
        let curr = 0;
        const batchSize = 30;
        while (curr <= spotifySongs.length) {
            const songUris = spotifySongs.slice(curr, curr + batchSize).map(s => s?.uri).filter(u => !!u);
            console.log(`Adding ${songUris.length} songs`)
            if (songUris.length > 0) {
                await spotifyClient.addPlaylistTracks(spotifyToken, playlist.id, songUris);
            }
            curr += batchSize;
        };
    }

    private selectSongFromResults(searchResult: SearchResponse, sslSong: StreamerSongListSong) {
        if (!searchResult?.tracks?.items?.[0]) {
            console.warn(`Could not find ${sslSong.artist} - ${sslSong.title}`);
            return undefined;
        }

        let ratedSongs = searchResult.tracks.items.map(item => ({
            song: item,
            artistRating: levenshtein(item.artists[0].name.toLowerCase(), sslSong.artist.toLowerCase()),
            titleRating: levenshtein(item.name.toLowerCase(), sslSong.title.toLowerCase())
        }));

        ratedSongs = ratedSongs.filter(s => s.song.artists[0].name.toLowerCase() === "various artists" || s.artistRating <= 6).sort((s1, s2) => {
            if (s1.artistRating !== s2.artistRating) {
                return s1.artistRating - s2.artistRating;
            }

            //if (s2.titleRating !== s1.titleRating) {
            //    return s1.titleRating - s2.titleRating;
            //}

            return s2.song.popularity - s1.song.popularity;
        });

        // TODO add a levenshtein threshold to remove songs that just might not have a match

        console.log(JSON.stringify(ratedSongs, null, 2));
        const selectedSong = ratedSongs?.[0]?.song;
        if (selectedSong) {
            console.log(`Selected ${selectedSong.artists[0].name} - ${selectedSong.name} as a match for ${sslSong.artist} - ${sslSong.title}`);
        } else {
            console.warn(`After filtering, could not find ${sslSong.artist} - ${sslSong.title}`)
        }

        return selectedSong;
    }
}