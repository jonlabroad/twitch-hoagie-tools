import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export function createDocClient(serviceUrl?: string) {
  const dbClient = new DynamoDBClient({
    endpoint: serviceUrl,
  });
  return DynamoDBDocumentClient.from(
    dbClient,
    {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    }
  );
}
