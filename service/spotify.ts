'use strict';

import Config from "./src/Config";
import SpotifyCreatePlaylist from "./src/spotify/SpotifyCreatePlaylist";
import SpotifyGetSongs from "./src/spotify/SpotifyGetSongs";
import SpotifySetToken from "./src/spotify/SpotifySetToken";
import ModAuthorizer from "./src/twitch/ModAuthorizer";
import TwitchAuthenticator from "./src/twitch/TwitchAuthenticator";
import { corsHeaders } from "./streamersonglist";

interface SetTokenRequestBody {
    token: string
    redirectUri: string
}

export interface GetSongsRequestBody {
    songs: {
        songKey: string
        artist: string
        title: string
    }[]
}

module.exports.getsongs = async (event: any) => {
    Config.validate(["TABLENAME"]);
    
    const authResponse = await TwitchAuthenticator.auth(event);
    if (authResponse) {
        return authResponse;
    }

    try {
        const request = JSON.parse(event.body ?? "{}") as GetSongsRequestBody;
        console.log({ request });

        const createPlaylist = new SpotifyGetSongs();
        const songInfos = await createPlaylist.getSongs(request.songs ?? []);

        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
            },
            body: JSON.stringify(songInfos)
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: err.message,
        }
    }
};
