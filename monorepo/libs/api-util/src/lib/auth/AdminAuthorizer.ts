import { AuthConfig } from "./AuthConfig";
import { corsHeaders } from "@hoagie/api-util";

export default class AdminAuthorizer {
    public static async auth(username: string) {
        // TODO put this in DB, possibly use user id's instead?
        const admins = AuthConfig.AdminUserNames;
        if (username && admins.includes(username?.toLowerCase())) {
            console.log("ADMIN AUTHORIZED");
            return undefined;
        }

        return {
            statusCode: 403,
            body: `Unauthorized ${username} is not an admin`,
            headers: corsHeaders,
        };;
    }
}