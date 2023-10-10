import { corsHeaders } from "../../twitch";
import ModsDbClient from "../channelDb/ModsDbClient";
import AdminAuthorizer from "./AdminAuthorizer";

export default class ModRequestAuthorizer {
    public static async auth(username: string, streamerLogin: string) {
        console.log({username, streamerLogin})

        // Allow admins
        /*
        const isAdminResponse = await AdminAuthorizer.auth(username);
        const isAdmin = !isAdminResponse;
        if (isAdmin) {
            return undefined;
        }
        */

        // They are who they say they are, but are they a mod?
        if (!streamerLogin) {
            console.error("Could not find streamer name");
            return {
                statusCode: 403,
                body: "Could not find streamer name",
                headers: corsHeaders,
            };
        }
        if (username && streamerLogin) {
            const modClient = new ModsDbClient(streamerLogin);
            const mods = await modClient.readMods();
            const isMod = mods?.mods.map(m => m.toLowerCase()).includes(username);
            const isStreamer = streamerLogin.toLowerCase() === username
            if (isMod || isStreamer) {
                return undefined;
            }
            console.log(`Unauthorized, ${username} not a mod`)
            return {
                statusCode: 403,
                body: `Unauthorized, ${username} not a mod`,
                headers: corsHeaders,
            };
        }

        console.log(`Unauthorized ${username} at ${streamerLogin}`);
        return {
            statusCode: 403,
            body: `Unauthorized ${username} ${streamerLogin}`,
            headers: corsHeaders,
        };;
    }
}