import { APIGatewayProxyEvent } from "aws-lambda";
import { corsHeaders } from "@hoagie/api-util";
import ModsDbClient from "../db/ModsDbClient";
import AdminAuthorizer from "./AdminAuthorizer";

export class ModRequestAuthorizer {
    public static async auth(username: string, event: APIGatewayProxyEvent) {
        const tableName = process.env['TABLENAME'];
        if (!tableName) {
            console.error("TABLENAME not set");
            return {
                statusCode: 500,
                body: "TABLENAME not set",
                headers: corsHeaders,
            };
        }

        // Allow admins
        const isAdminResponse = await AdminAuthorizer.auth(username);
        const isAdmin = !isAdminResponse;
        if (isAdmin) {
            return undefined;
        }

        // They are who they say they are, but are they a mod?
        const streamername = event.queryStringParameters?.["streamerName"]?.toLowerCase() ?? event.queryStringParameters?.["streamername"]?.toLowerCase() ??
            event.queryStringParameters?.["streamerLogin"]?.toLowerCase() ?? event.queryStringParameters?.["streamerlogin"]?.toLowerCase();
        if (username && streamername) {
            const modClient = new ModsDbClient(tableName, streamername);
            const mods = await modClient.readMods();
            const isMod = mods?.mods.map(m => m.toLowerCase()).includes(username);
            const isStreamer = streamername.toLowerCase() === username
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