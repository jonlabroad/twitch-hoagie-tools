import { APIGatewayAuthorizerEvent, APIGatewayEvent, APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import { corsHeaders } from "../../twitch";
import { BasicAuth } from "../util/BasicAuth";
import TwitchClient from "./TwitchClient";

export default class TwitchLambdaAuthenticator {
    public static async auth(event: APIGatewayTokenAuthorizerEvent | APIGatewayAuthorizerEvent) {
        console.log({ event });
        // V1 vs V2
        const authHeader = (event as APIGatewayTokenAuthorizerEvent).authorizationToken ?? (event as any).headers?.authorization;

        const auth = BasicAuth.decode(authHeader ?? "")
        if (!auth.username || !auth.token) {
            console.log("NO VALID CREDENTIALS");
            return {
                statusCode: 401,
                body: "Unauthorized",
                headers: corsHeaders,
            }
        }

        const client = new TwitchClient();
        console.log({ auth });
        const validationResponse = await client.validateUserIdAndToken(auth.username, auth.token);
        console.log({ validationResponse });
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