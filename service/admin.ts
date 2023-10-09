'use strict';

import { APIGatewayProxyEvent } from "aws-lambda";
import { AdminData } from "./src/channelDb/AdminDbClient";
import Config from "./src/Config";
import ConfigProvider from "./src/config/ConfigProvider";
import AdminAuthorizer from "./src/twitch/AdminAuthorizer";
import { BasicAuth } from "./src/util/BasicAuth";

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

module.exports.getconfig = async (event: APIGatewayProxyEvent) => {
    try {
        Config.validate();

        const { username } = BasicAuth.decode(event.headers.Authorization ?? "")
        const auth = await AdminAuthorizer.auth(username);
        if (auth) {
            return auth;
        }

        return {
            statusCode: 200,
            body: JSON.stringify(await ConfigProvider.get(), null, 2),
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

module.exports.setstreamers = async (event: APIGatewayProxyEvent) => {
    try {
        Config.validate();

        const { username } = BasicAuth.decode(event.headers.Authorization ?? "")
        const auth = await AdminAuthorizer.auth(username);
        if (auth) {
            return auth;
        }

        const request = JSON.parse(event.body ?? "{}") as { streamers: string[] };
        if (request.streamers) {
            await ConfigProvider.setStreamers(request.streamers);
            return {
                statusCode: 200,
                body: "OK",
                headers: {
                    ...corsHeaders,
                },
            };
        }

        return {
            statusCode: 400,
            body: "No streamer specified",
            headers: {
                ...corsHeaders,
            },
        }
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

module.exports.setconfig = async (event: APIGatewayProxyEvent) => {
    try {
        Config.validate();

        const { username } = BasicAuth.decode(event.headers.Authorization ?? "")
        const auth = await AdminAuthorizer.auth(username);
        if (auth) {
            return auth;
        }

        const request = JSON.parse(event.body ?? "{}") as { config: AdminData };
        if (request.config) {
            await ConfigProvider.set(request.config);
            return {
                statusCode: 200,
                body: "OK",
                headers: {
                    ...corsHeaders,
                },
            };
        }

        return {
            statusCode: 400,
            body: "No streamer specified",
            headers: {
                ...corsHeaders,
            },
        }
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

