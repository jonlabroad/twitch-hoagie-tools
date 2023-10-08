import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

export function createDocClient() {
    return DynamoDBDocumentClient.from(new DynamoDBClient({}));
};