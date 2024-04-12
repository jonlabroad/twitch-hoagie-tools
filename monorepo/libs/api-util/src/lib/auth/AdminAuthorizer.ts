import { AuthConfig } from "./AuthConfig";
import { corsHeaders } from "@hoagie/api-util";

export default class AdminAuthorizer {
    public static async auth(userId: string) {
        // TODO put this in DB
        const admins = AuthConfig.AdminUserIds;
        if (userId && admins.includes(userId?.toLowerCase())) {
            console.log("ADMIN AUTHORIZED");
            return undefined;
        }

        return {
            statusCode: 403,
            body: `Unauthorized ${userId} is not an admin`,
            headers: corsHeaders,
        };;
    }
}
