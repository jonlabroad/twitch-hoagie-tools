'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
import generateApiKey from "generate-api-key";
import BotTokenDbClient from "./src/channelDb/BotTokenDbClient";
import { ChatCommandProcessor } from "./src/chatbot/ChatCommandProcessor";
import Config from "./src/Config";
import BotTokenAuthorizer from "./src/twitch/BotTokenAuthorizer";
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
    botToken: string
}

module.exports.command = async (event: APIGatewayProxyEvent) => {
    Config.validate(["TABLENAME"]);

    const authResponse = await BotTokenAuthorizer.auth(event)
    if (authResponse) {
        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                ...noCacheHeaders
            },
            body: `Unauthorized to run command`
        };
    }

    const cmdProcessor = new ChatCommandProcessor()
    const commandResult = await cmdProcessor.process(event.queryStringParameters?.command ?? "", event.queryStringParameters ?? {})
    console.log({ commandResult })
    return {
        statusCode: 200,
        headers: {
            ...corsHeaders,
            ...noCacheHeaders
        },
        body: commandResult?.message ?? "Something went wrong 😵‍💫"
    }
}

module.exports.refreshtoken = async (event: APIGatewayProxyEvent) => {
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
        const newToken = generateApiKey({ method: 'base32', dashes: false }) as string;
        await new BotTokenDbClient().set(newToken, username);
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

module.exports.gettoken = async (event: APIGatewayProxyEvent) => {
    Config.validate(["TABLENAME"]);

    const { username } = BasicAuth.decode(event.headers.Authorization ?? "")
    const streamerName = event.queryStringParameters?.["streamername"] ?? "";
    const authenticationResponse = await ModRequestAuthorizer.auth(username, streamerName);
    if (authenticationResponse) {
        return authenticationResponse;
    }

    try {
        const streamerName = event.queryStringParameters?.["streamername"] ?? "";
        const botToken = await new BotTokenDbClient().read(streamerName)
        const response = {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                ...noCacheHeaders,
            },
            body: JSON.stringify(botToken, null, 2)
        };
        return response
    } catch (err) {
        console.error(err)
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: err.message,
        }
    }
}
