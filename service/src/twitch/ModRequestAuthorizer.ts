import { corsHeaders } from "../../twitch";
import Config from "../Config";
import ModsDbClient from "../channelDb/ModsDbClient";
import AdminAuthorizer from "./AdminAuthorizer";

export default class ModRequestAuthorizer {
    public static async auth(userId: string, streamerId: string) {
        console.log({userId, streamerId})

        // Allow admins
        const isAdminResponse = await AdminAuthorizer.auth(userId);
        const isAdmin = !isAdminResponse;
        if (isAdmin) {
            return undefined;
        }

        // They are who they say they are, but are they a mod?
        if (!streamerId) {
            console.error("Could not find streamer id");
            return {
                statusCode: 403,
                body: "Could not find streamer id",
                headers: corsHeaders,
            };
        }
        if (userId && streamerId) {
            const modClient = new ModsDbClient(Config.tableName, streamerId);
            const mods = await modClient.readMods();
            const isMod = mods?.mods.map(m => m.toLowerCase()).includes(userId);
            const isStreamer = streamerId === userId
            if (isMod || isStreamer) {
                return undefined;
            }
            console.log(`Unauthorized, ${userId} not a mod`)
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