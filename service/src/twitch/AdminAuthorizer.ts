import { APIGatewayProxyEvent } from "aws-lambda";
import { corsHeaders } from "../../twitch";
import Config from "../Config";

export default class AdminAuthorizer {
    public static async auth(username: string) {
        // TODO put this in DB, possibly use user id's instead?
        const admins = Config.AdminUserNames;
        console.log({admins});
        console.log({username});
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