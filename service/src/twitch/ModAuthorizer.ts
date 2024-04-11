import { APIGatewayProxyEvent } from "aws-lambda";
import { corsHeaders } from "../../twitch";
import ModsDbClient from "../channelDb/ModsDbClient";
import AdminAuthorizer from "./AdminAuthorizer";
import TwitchRequestAuthenticator from "./TwitchRequestAuthenticator";
import Config from "../Config";

export default class ModAuthorizer {
    public static async auth(event: APIGatewayProxyEvent) {
        const twitchAuth = await TwitchRequestAuthenticator.auth(event);
        if (twitchAuth) {
            return twitchAuth;
        }

        // They are who they say they are, but are they a mod?
        const userId = event.queryStringParameters?.["userId"]?.toLowerCase();
        const streamerId = event.queryStringParameters?.["streamerId"]?.toLowerCase();
        if (userId && streamerId) {
            const modClient = new ModsDbClient(Config.tableName, streamerId);
            const mods = await modClient.readMods();
            const isMod = mods?.mods.map(m => m.toLowerCase()).includes(userId);
            if (isMod) {
                return undefined;
            }
            return {
                statusCode: 403,
                body: `Unauthorized, ${userId} not a mod`,
                headers: corsHeaders,
            };
        }

        console.log(`Unauthorized ${userId} at ${streamerId}`);
        return {
            statusCode: 403,
            body: `Unauthorized ${userId} ${streamerId}`,
            headers: corsHeaders,
        };;
    }
}