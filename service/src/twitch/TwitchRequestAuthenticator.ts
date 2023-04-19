import { APIGatewayProxyEvent } from "aws-lambda";
import { corsHeaders } from "../../twitch";
import TwitchClient from "./TwitchClient";

export type AuthLevel = "admin" | "streamer";

export default class TwitchRequestAuthenticator {
    public static async auth(event: APIGatewayProxyEvent) {
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

        return undefined;
    }
}