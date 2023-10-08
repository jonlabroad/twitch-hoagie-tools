import { APIGatewayEvent } from "aws-lambda";
import { BasicAuth } from "@hoagie/api-util";

export class GetDonos {
    public static async run(event: APIGatewayEvent) {
        // Config.validate();

        const { streamerLogin, userLogin, streamIds} = event.queryStringParameters ?? {};
    
        const { username } = BasicAuth.decode(event.headers.Authorization ?? "");
        const auth = await ModRequestAuthorizer.auth(username, event);
        if (auth) {
          return auth;
        }
    
        const donos = await DonoProvider.get(streamerLogin, streamIds);
    
        return {
            statusCode: 200,
            body: "hello getdono"
        };
    }
}