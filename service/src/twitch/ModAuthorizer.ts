import { APIGatewayProxyEvent } from "aws-lambda";
import { corsHeaders } from "../../twitch";
import ModsDbClient from "../channelDb/ModsDbClient";
import TwitchAuthorizer from "./TwitchAuthorizer";

export default class ModAuthorizer {
    public static async auth(event: APIGatewayProxyEvent) {
        const twitchAuth = await TwitchAuthorizer.auth(event);
        if (twitchAuth) {
            return twitchAuth;
        }

        // They are who they say they are, but are they a mod?
        const username = event.queryStringParameters?.["username"]?.toLowerCase();
        const streamername = event.queryStringParameters?.["streamername"]?.toLowerCase();
        console.log({ username, streamername });
        if (username && streamername) {
            const modClient = new ModsDbClient(streamername);
            const mods = await modClient.readMods();
            console.log({ mods });
            const isMod = mods?.mods.map(m => m.toLowerCase()).includes(username);
            console.log({ isMod });
            if (isMod) {
                return undefined;
            }
            return {
                statusCode: 403,
                body: "Unauthorized, not a mod",
                headers: corsHeaders,
            };
        }

        return {
            statusCode: 403,
            body: `Unauthorized ${username} ${streamername}`,
            headers: corsHeaders,
        };;
    }
}