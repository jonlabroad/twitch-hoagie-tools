'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
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
        const { username: userId } = BasicAuth.decode(event.headers.Authorization ?? "");

        const streamerId = event.queryStringParameters?.streamerid ?? "No streamer id specified";
        const authenticationResponse = await ModRequestAuthorizer.auth(userId, streamerId);
        if (authenticationResponse) {
          return authenticationResponse;
        }

        const status = await GetSystemStatus.get(streamerId);
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

