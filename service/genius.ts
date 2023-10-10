'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
import Config from "./src/Config";
import GeniusClient from "./src/genius/GeniusClient";
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

module.exports.getlyrics = async (event: APIGatewayProxyEvent) => {
    Config.validate(["TABLENAME"]);

    const { username } = BasicAuth.decode(event.headers.Authorization ?? "")
    const streamerName = event.queryStringParameters?.["streamername"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(username, streamerName);
    if (authenticationResponse) {
        return authenticationResponse;
    }

    let body: any = "err";
    try {
        const query = event.queryStringParameters?.["query"] ?? "";
        const geniusClient = new GeniusClient(Config.GeniusClientSecret);
        const geniusSong = await geniusClient.getSong(query);
        const lyrics = await geniusClient.getLyricsFromUrl(geniusSong.url);

        body = {
            song: geniusSong,
            lyrics
        };

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
        },
        body: JSON.stringify(body)
    };
}
