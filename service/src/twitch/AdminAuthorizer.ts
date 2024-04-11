import { APIGatewayProxyEvent } from "aws-lambda";
import { corsHeaders } from "../../twitch";
import Config from "../Config";

export default class AdminAuthorizer {
    public static async auth(userId: string) {
        // TODO put this in DB
        const admins = Config.AdminUserIds;
        console.log({admins});
        console.log({userId});
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