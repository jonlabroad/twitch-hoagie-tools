'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
import Config from "./src/Config";
import DonoProvider from "./src/twitch/DonoProvider";
import { HoagieEventPublisher } from "./src/eventbus/HoagieEventPublisher";
import TwitchClient from "./src/twitch/TwitchClient";

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': true,
};

export const noCacheHeaders = {
    "Cache-Control": "no-cache"
}

const followCacheHeaders = {
    "Cache-Control": "max-age=5"
}

export interface SetDonoRequest {
    streamerLogin: string
    userLogin: string
    type: "cheer" | "dono" | "sub" | "subgift"
    amount: number
    tier: 1 | 2 | 3;
}

module.exports.adddono = async (event: APIGatewayProxyEvent) => {
    try {
        Config.validate();

        // TODO auth using token

        const data = JSON.parse(event.body ?? "{}") as SetDonoRequest;
        console.log({ data });
        const donoData = await DonoProvider.setDono(data);

        const broadcasterId = await (new TwitchClient()).getUserId(data.streamerLogin);
        await HoagieEventPublisher.publishToTopic(`dono.${broadcasterId}`, data);

        return {
            statusCode: 200,
            body: JSON.stringify({
                donos: donoData,
            }, null, 2),
            headers: {
                ...corsHeaders,
                ...followCacheHeaders
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

