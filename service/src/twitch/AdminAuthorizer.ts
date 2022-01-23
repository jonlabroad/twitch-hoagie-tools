import { APIGatewayProxyEvent } from "aws-lambda";
import { corsHeaders } from "../../twitch";
import TwitchAuthorizer from "./TwitchAuthorizer";

export default class AdminAuthorizer {
    public static async auth(event: APIGatewayProxyEvent) {
        const twitchAuth = await TwitchAuthorizer.auth(event);
        if (twitchAuth) {
            return twitchAuth;
        }

        // They are who they say they are, but are they an admin?
        const username = event.queryStringParameters?.["username"]?.toLowerCase();
        // TODO put this in DB, possibly use user id's instead?
        if (username?.toLowerCase() === "hoagieman5000") {
            return undefined;
        }

        return {
            statusCode: 403,
            body: `Unauthorized ${username} is not an admin`,
            headers: corsHeaders,
        };;
    }
}