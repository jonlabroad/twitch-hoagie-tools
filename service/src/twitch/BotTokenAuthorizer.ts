import { APIGatewayProxyEvent } from "aws-lambda";
import { corsHeaders } from "../../twitch";
import BotTokenDbClient from "../channelDb/BotTokenDbClient";

export default class BotTokenAuthorizer {
    public static async auth(event: APIGatewayProxyEvent) {
        const streamerName = event.queryStringParameters?.["streamername"]?.toLowerCase();
        if (streamerName) {
            const streamerToken = await (new BotTokenDbClient()).read(streamerName)
            if (streamerToken) {
                const inputToken = event.queryStringParameters?.accesstoken ?? ""
                if (inputToken && streamerToken && inputToken === streamerToken.botToken) {
                    // OK
                    return
                }
            }
        }

        console.log(`Unauthorized`)
        return {
            statusCode: 403,
            body: `Unauthorized`,
            headers: corsHeaders,
        };
    }
}