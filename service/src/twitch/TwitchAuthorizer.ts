import { APIGatewayProxyEvent } from "aws-lambda";
import { corsHeaders } from "../../twitch";
import Config from "../Config";
import TwitchClient from "./TwitchClient";

export type AuthLevel = "admin" | "streamer";

export default class TwitchAuthorizer {
    public static async auth(event: APIGatewayProxyEvent, level: AuthLevel) {
        const username = event.queryStringParameters?.["username"];
        const authHeader = event.headers["Authorization"];
        const authToken = authHeader?.replace("Bearer ", "");
        if (!username || !authToken) {
            return {
                statusCode: 401,
                body: "Unauthorized",
                headers: corsHeaders,
            }
        }

        const client = new TwitchClient();
        const validationResponse = await client.validateUserIdAndToken(username, authToken);
        if (!validationResponse.validated) {
            return {
                statusCode: 401,
                body: "Invalid username and token",
                headers: corsHeaders,
            }
        }

        const isAuthorized = Config.isAdminOrStreamer(username);
        if (!isAuthorized) {
            return {
                statusCode: 403,
                body: "Unauthorized",
                headers: corsHeaders,
            }
        }

        return undefined;
    }
}