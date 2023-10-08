import { APIGatewayEvent } from "aws-lambda";

export class GetDonos {
    public static async run(event: APIGatewayEvent) {
        return {
            statusCode: 200,
            body: "hello getdono"
        };
    }
}