'use strict';

import PerspectiveClient from "./src/PerspectiveClient";

module.exports.eval = async (event: any) => {
    console.log(event);

    const apiKey = process.env.PERSPECTIVE_API_KEY;
    if (!apiKey) {
        return {
            statusCode: 400,
            message: "Missing api key in PERSPECTIVE_API_KEY env var"
        }
    }

    const message = decodeURIComponent(event.queryStringParameters.msg);
    console.log({message});
    const client = new PerspectiveClient(apiKey);
    const response = await client.analyze(message);

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(
            {
                evaluation: response
            },
            null,
            2
        ),
    };
};
