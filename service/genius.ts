'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
import Config from "./src/Config";
import GeniusClient from "./src/genius/GeniusClient";
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

module.exports.getlyrics = async (event: APIGatewayProxyEvent) => {
    Config.validate(["TABLENAME"]);
/*
    const authResponse = await TwitchAuthenticator.auth(event);
    if (authResponse) {
        return authResponse;
    }

    const authenticationResponse = await ModAuthorizer.auth(event);
    if (authenticationResponse) {
        return authenticationResponse;
    }
*/
    let body: any = "err";
    try {
        const query = event.queryStringParameters?.["query"] ?? "";
        const geniusClient = new GeniusClient(Config.GeniusClientId, Config.GeniusClientSecret);
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
            ...noCacheHeaders,
        },
        body: JSON.stringify(body)
    };
}
