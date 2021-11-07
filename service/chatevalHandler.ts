'use strict';

import PerspectiveClient from "./src/PerspectiveClient";

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': true,
};

export const cacheHeaders = {
    "Cache-Control": "max-age=3600"
}

module.exports.eval = async (event: any) => {
    const apiKey = process.env.PERSPECTIVE_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 400,
            message: "Missing api key in PERSPECTIVE_API_KEY env var"
        }
    }

    const message = decodeURIComponent(event.queryStringParameters.msg);
    const client = new PerspectiveClient(apiKey);
    const response = await client.analyze(message);

    if (!response.error) {
        return {
            statusCode: 200,
            headers: {
                ...corsHeaders,
                ...cacheHeaders,
            },
            body: JSON.stringify(
                {
                    evaluation: response.results
                },
                null,
                2
            ),
        };
    }
    return {
        statusCode: 500,
        headers: {
            ...corsHeaders
        },
        body: response.error ?? "unknown error"
    }

};
