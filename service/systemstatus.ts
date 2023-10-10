'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
import TwitchClient from "./src/twitch/TwitchClient";
import { BasicAuth } from "./src/util/BasicAuth";
import ModRequestAuthorizer from "./src/twitch/ModRequestAuthorizer";
import { GetSystemStatus } from "./src/system/status/GetSystemStatus";

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': true,
};

export const noCacheHeaders = {
    "Cache-Control": "no-cache"
}

const cacheHeaders = {
    "Cache-Control": "max-age=10"
}

module.exports.getstatus = async (event: APIGatewayProxyEvent) => {
    try {
        const { username } = BasicAuth.decode(event.headers.Authorization ?? "");

        const streamerName = event.queryStringParameters?.streamername ?? event.queryStringParameters?.streamerlogin ?? event.queryStringParameters?.streamerLogin ?? "";
        const authenticationResponse = await ModRequestAuthorizer.auth(username, streamerName);
        if (authenticationResponse) {
          return authenticationResponse;
        }

        const broadcasterId = await (new TwitchClient()).getUserId(streamerName);
        if (!broadcasterId) {
            throw new Error(`Broadcaster ID for ${streamerName} not found`);
        }

        const status = await GetSystemStatus.get(broadcasterId);
        return {
            statusCode: 200,
            body: JSON.stringify({
                status,
            }, null, 2),
            headers: {
                ...corsHeaders,
                ...cacheHeaders
            },
        };
    } catch (err) {
        console.error(err.message, err);
        return {
            statusCode: 500,
            headers: {
                ...corsHeaders,
            },
            body: `${err.message}`
        }
    }
}

