'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
import Config from "./src/Config";
import StreamerSongListToken from "./src/StreamerSongList/StreamerSongListSetToken";
import ModAuthorizer from "./src/twitch/ModAuthorizer";
import TwitchAuthenticator from "./src/twitch/TwitchAuthenticator";

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

    const authResponse = await TwitchAuthenticator.auth(event);
    if (authResponse) {
        return authResponse;
    }

    const authenticationResponse = await ModAuthorizer.auth(event);
    if (authenticationResponse) {
        return authenticationResponse;
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

    const authResponse = await TwitchAuthenticator.auth(event);
    if (authResponse) {
        return authResponse;
    }

    const authenticationResponse = await ModAuthorizer.auth(event);
    if (authenticationResponse) {
        return authenticationResponse;
    }

    let tokenValidated = false;
    try {
        const streamerName = event.queryStringParameters?.["streamername"] ?? "";
        const sslToken = await StreamerSongListToken.readToken(streamerName);
        if (!sslToken) {
            throw new Error(`No ssl token found for user ${streamerName}`);
        }
        tokenValidated = await StreamerSongListToken.validateToken(streamerName, sslToken);
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

module.exports.selectrandom = async (event: APIGatewayProxyEvent) => {
    
}
