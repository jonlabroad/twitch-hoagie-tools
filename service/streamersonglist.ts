'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
import Config from "./src/Config";
import StreamerSongListToken from "./src/StreamerSongList/StreamerSongListSetToken";
import ModRequestAuthorizer from "./src/twitch/ModRequestAuthorizer";
import { BasicAuth } from "./src/util/BasicAuth";

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

    const { username } = BasicAuth.decode(event.headers.Authorization ?? "")
    const streamerName = event.queryStringParameters?.["streamername"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(username, streamerName);
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

    const { username: userId } = BasicAuth.decode(event.headers.Authorization ?? "")
    const streamerId = event.queryStringParameters?.["streamerid"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(userId, streamerId);
    if (authenticationResponse) {
        return authenticationResponse;
    }

    let tokenValidated = false;
    try {
        const sslToken = await StreamerSongListToken.readToken(streamerId);
        if (!sslToken) {
            throw new Error(`No ssl token found for user ${streamerId}`);
        }
        tokenValidated = await StreamerSongListToken.validateToken(streamerId, sslToken);
    } catch (err) {
        console.error(err);
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
