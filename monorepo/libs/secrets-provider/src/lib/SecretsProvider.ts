import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export class SecretsProvider {
  private static instance: SecretsProvider;
  public secrets: Record<string, any> = {};
  public static initialized = false;

  private constructor() {}

  public static async init() {
    const instance = SecretsProvider.getInstance();
    const dbClient = new DynamoDBClient({ region: 'us-east-1' });
    const docClient = DynamoDBDocumentClient.from(dbClient);

    const response = await docClient.send(
      new QueryCommand({
        TableName: 'HoagieTools-prod',
        KeyConditionExpression: `#CategoryKey = :catkey`,
        ExpressionAttributeNames: {
          '#CategoryKey': `CategoryKey`,
        },
        ExpressionAttributeValues: {
          ':catkey': { S: 'SECRETS' },
        },
      } as QueryCommandInput)
    );
    response.Items?.forEach((item) => {
      instance.secrets[item?.['SubKey'].S ?? ''] = item['value'].S;
    });
    SecretsProvider.initialized = true;
  }

  public static getInstance(): SecretsProvider {
    if (!SecretsProvider.initialized) {
      throw new Error(
        'SecretsProvider not initialized. Call SecretsProvider.init() first.'
      );
    }

    if (!SecretsProvider.instance) {
      SecretsProvider.instance = new SecretsProvider();
    }

    return SecretsProvider.instance;
  }
}
