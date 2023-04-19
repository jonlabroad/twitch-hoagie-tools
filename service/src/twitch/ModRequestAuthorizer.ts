import { APIGatewayProxyEvent } from "aws-lambda";
import { corsHeaders } from "../../twitch";
import ModsDbClient from "../channelDb/ModsDbClient";
import AdminAuthorizer from "./AdminAuthorizer";

export default class ModRequestAuthorizer {
    public static async auth(username: string, event: APIGatewayProxyEvent) {
        console.log(`ModRequestAuthorizer`);
        console.log({username, event})

        // Allow admins
        const isAdminResponse = await AdminAuthorizer.auth(username);
        const isAdmin = !isAdminResponse;
        console.log({isAdminResponse})
        if (isAdmin) {
            return undefined;
        }

        // They are who they say they are, but are they a mod?
        const streamername = event.queryStringParameters?.["streamername"]?.toLowerCase();
        console.log({streamername})
        if (username && streamername) {
            const modClient = new ModsDbClient(streamername);
            const mods = await modClient.readMods();
            console.log({mods})
            const isMod = mods?.mods.map(m => m.toLowerCase()).includes(username);
            const isStreamer = streamername.toLowerCase() === username
            console.log({isMod, isStreamer})
            if (isMod || isStreamer) {
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