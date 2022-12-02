'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
import BadWordsClient from "./src/badwords/BadWordsClient";
import EvalDbClient from "./src/channelDb/EvalDbClient";
import Config from "./src/Config";
import GeniusClient from "./src/genius/GeniusClient";
import ModAuthorizer from "./src/twitch/ModAuthorizer";
import TwitchAuthenticator from "./src/twitch/TwitchAuthenticator";
import { noCacheHeaders } from "./twitch-dono";

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': true,
};

export const cacheHeaders = {
    "Cache-Control": "max-age=14400"
}

module.exports.eval = async (event: APIGatewayProxyEvent) => {
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
        const geniusClient = new GeniusClient(Config.GeniusClientSecret);
        const geniusSong = await geniusClient.getSong(query);
        const lyrics = geniusSong ? await geniusClient.getLyricsFromUrl(geniusSong.url) : "";

        //Evaluate the lyrics
        let lyricsEval: any = undefined;
        if (lyrics) {
            const badWordsClient = new BadWordsClient(Config.BadWordsSecret);
            lyricsEval = await badWordsClient.eval(geniusSong.full_title, lyrics);
        }

        body = {
            song: geniusSong,
            lyrics,
            lyricsEval,
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
            ...cacheHeaders,
        },
        body: JSON.stringify(body)
    };
}

module.exports.readconfig = async (event: APIGatewayProxyEvent) => {
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

    //    const auth = await ModAuthorizer.auth(event);
    //    if (auth) {
    //        return auth;
    //    }

    let config: any = "err";
    try {
        const streamerLogin = event.queryStringParameters?.["streamername"] ?? "";
        const client = new EvalDbClient();
        config = await client.read(streamerLogin);
        console.log({ config });
        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                ...noCacheHeaders,
            },
            body: JSON.stringify(config)
        }
    } catch (err) {
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: err.message,
        }
    }
}

module.exports.addwhitelistword = async (event: APIGatewayProxyEvent) => {
    Config.validate(["TABLENAME"]);
    //    const auth = await ModAuthorizer.auth(event);
    //    if (auth) {
    //        return auth;
    //    }

    let body: any = "err";
    try {
        const word = event.queryStringParameters?.["word"] ?? "";
        const remove = event.queryStringParameters?.["remove"];
        const streamerLogin = event.queryStringParameters?.["streamername"] ?? "";
        console.log({ word, remove });
        if (word) {
            const client = new EvalDbClient();
            console.log({ streamerLogin, word });
            if (!remove || remove?.toLowerCase() !== "true") {
                await client.addWhitelistWord(streamerLogin, word);
            } else {
                await client.removeWhitelistWord(streamerLogin, word);
            }
        }

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
            ...noCacheHeaders
        },
        body: "OK"
    };
}
