import { APIGatewayProxyEvent } from "aws-lambda";
import { corsHeaders } from "../../twitch";
import ModsDbClient from "../channelDb/ModsDbClient";
import AdminAuthorizer from "./AdminAuthorizer";
import TwitchRequestAuthenticator from "./TwitchRequestAuthenticator";

export default class ModAuthorizer {
    public static async auth(event: APIGatewayProxyEvent) {
        const twitchAuth = await TwitchRequestAuthenticator.auth(event);
        if (twitchAuth) {
            return twitchAuth;
        }

        // They are who they say they are, but are they a mod?
        const username = event.queryStringParameters?.["username"]?.toLowerCase();
        const streamername = event.queryStringParameters?.["streamername"]?.toLowerCase();
        if (username && streamername) {
            const modClient = new ModsDbClient(streamername);
            const mods = await modClient.readMods();
            const isMod = mods?.mods.map(m => m.toLowerCase()).includes(username);
            if (isMod) {
                return undefined;
            }
            return {
                statusCode: 403,
                body: `Unauthorized, ${username} not a mod`,
                headers: corsHeaders,
            };
        }

        console.log(`Unauthorized ${username} at ${streamername}`);
        return {
            statusCode: 403,
            body: `Unauthorized ${username} ${streamername}`,
            headers: corsHeaders,
        };;
    }
}