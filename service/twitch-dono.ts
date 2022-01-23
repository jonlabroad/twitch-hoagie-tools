'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
import Config from "./src/Config";
import DonoProvider from "./src/twitch/DonoProvider";

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
}

module.exports.adddono = async (event: APIGatewayProxyEvent) => {
    try {
        Config.validate();

        // TODO auth using token

        const data = JSON.parse(event.body ?? "{}") as SetDonoRequest;

        return {
            statusCode: 200,
            body: JSON.stringify({
                donos: await DonoProvider.setDono(data),
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

