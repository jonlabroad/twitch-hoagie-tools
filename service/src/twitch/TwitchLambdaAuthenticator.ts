import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import { corsHeaders } from "../../twitch";
import { BasicAuth } from "../util/BasicAuth";
import TwitchClient from "./TwitchClient";

export default class TwitchLambdaAuthenticator {
    public static async auth(event: APIGatewayTokenAuthorizerEvent) {
        const authHeader = event.authorizationToken;
        const auth = BasicAuth.decode(authHeader ?? "")
        if (!auth.username || !auth.token) {
            return {
                statusCode: 401,
                body: "Unauthorized",
                headers: corsHeaders,
            }
        }

        const client = new TwitchClient();
        const validationResponse = await client.validateUserIdAndToken(auth.username, auth.token);
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