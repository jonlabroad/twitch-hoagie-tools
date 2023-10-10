'use strict';

import Config from "./src/Config";
import SpotifyCreatePlaylist from "./src/spotify/SpotifyCreatePlaylist";
import SpotifySetToken from "./src/spotify/SpotifySetToken";
import ModRequestAuthorizer from "./src/twitch/ModRequestAuthorizer";
import { BasicAuth } from "./src/util/BasicAuth";
import { corsHeaders } from "./streamersonglist";

interface SetTokenRequestBody {
    token: string
    redirectUri: string
}

export interface CreatePlaylistRequestBody {
    streamerName: string
}

module.exports.generate = async (event: any) => {
    Config.validate(["TABLENAME"]);

    const username = event.queryStringParameters?.["username"] ?? "";

    const request = JSON.parse(event.body ?? "{}") as CreatePlaylistRequestBody;

    const createPlaylist = new SpotifyCreatePlaylist(request.streamerName, username);
    await createPlaylist.create();
};

module.exports.settoken = async (event: any) => {
    Config.validate(["TABLENAME"]);

    const { username } = BasicAuth.decode(event.headers.Authorization ?? "")
    const streamerName = event.queryStringParameters?.["streamername"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(username, streamerName);
    if (authenticationResponse) {
        return authenticationResponse;
    }

    try {
        const request = JSON.parse(event.body ?? "{}") as SetTokenRequestBody;
        const username = event.queryStringParameters?.["username"] ?? "";
        const token = request.token;
        const redirectUri = request.redirectUri;
        await SpotifySetToken.setToken(username, token, redirectUri);
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: err.message,
        }
    }

    return {
        statusCode: 200,
        headers: corsHeaders,
    };
};
