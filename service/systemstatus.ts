'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
import Config from "./src/Config";
import DonoProvider from "./src/twitch/DonoProvider";
import { HoagieEventPublisher } from "./src/eventbus/HoagieEventPublisher";
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
        const authenticationResponse = await ModRequestAuthorizer.auth(username, event);
        if (authenticationResponse) {
          return authenticationResponse;
        }

        const streamerName = event.queryStringParameters?.streamername ?? "";
        if (!streamerName) {
            throw new Error("Streamer name is required");
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

