import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export function createDocClient(serviceUrl?: string) {
  let dbClient;
  if (serviceUrl) {
    dbClient = new DynamoDBClient({
      endpoint: serviceUrl,
    });
  } else {
    dbClient = new DynamoDBClient();
  }

  return DynamoDBDocumentClient.from(
    dbClient,
    {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    }
  );
}
