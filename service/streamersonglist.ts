'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
import Config from "./src/Config";
import StreamerSongListToken from "./src/StreamerSongList/StreamerSongListSetToken";
import TwitchAuthorizer from "./src/twitch/TwitchAuthorizer";

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': true,
};

export const noCacheHeaders = {
    "Cache-Control": "no-cache"
}

interface SetTokenRequestBody {
    username: string
    streamerSongListToken: string
}

module.exports.settoken = async (event: APIGatewayProxyEvent) => {
    Config.validate(["TABLENAME"]);

    const authResponse = await TwitchAuthorizer.auth(event, "streamer");
    if (authResponse) {
        return authResponse;
    }

    try {
        const request = JSON.parse(event.body ?? "{}") as SetTokenRequestBody;
        const username = request.username;
        const sslToken = request.streamerSongListToken;
        await StreamerSongListToken.setToken(username, sslToken);
    } catch (err) {
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

module.exports.getstatus = async (event: APIGatewayProxyEvent) => {
    Config.validate(["TABLENAME"]);

    const authResponse = await TwitchAuthorizer.auth(event, "streamer");
    if (authResponse) {
        return authResponse;
    }

    let tokenValidated = false;
    try {
        const username = event.queryStringParameters?.["username"] ?? "";
        const sslToken = await StreamerSongListToken.readToken(username);
        if (!sslToken) {
            throw new Error(`No ssl token found for user ${username}`);
        }
        tokenValidated = await StreamerSongListToken.validateToken(username, sslToken);
    } catch (err) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: err.message,
        }
    }

    return {
        statusCode: 200,
        headers: {
            ...corsHeaders,
            ...noCacheHeaders,
        },
        body: tokenValidated ? "CONNECTED" : "DISCONNECTED"
    };
}
