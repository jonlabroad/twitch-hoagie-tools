import { GetCommand, PutCommand, PutCommandInput, QueryCommand, QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import { createDocClient } from './DBUtil';

export abstract class ISimpleObjectDBClient<K, T> {
  protected abstract readonly CATEGORY: string;
  protected abstract readonly defaultValue: T;

  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public async set(keyValue: K, value: T) {
    const client = createDocClient();
    try {
      const key = {
        CategoryKey: this.getKey(keyValue),
        SubKey: this.getSort(keyValue),
      };

      const input: PutCommandInput = {
        TableName: this.tableName,
        Item: {
          ...key,
          ...value,
        },
      };

      const command = new PutCommand(input);
      console.log(JSON.stringify(input, null, 2));
      await client.send(command);
    } catch (err) {
      console.error(err);
    }
  }

  public async get(keyValue: K): Promise<T> {
    const client = createDocClient();

    const input = {
      TableName: this.tableName,
      Key: {
        CategoryKey: this.getKey(keyValue),
        SubKey: this.getSort(keyValue),
      },
    };

    console.log({ input });
    const request: GetCommand = new GetCommand(input);
    const response = await client.send(request);
    console.log(response);
    return response?.Item as T;
  }

  public async getOrDefault(keyValue: K): Promise<T> {
    const existing = await this.get(keyValue);
    if (!existing) {
      await this.set(keyValue, this.defaultValue);
      return this.defaultValue;
    }
    return existing;
  }

  public async queryAll(key: Partial<K>): Promise<T[]> {
    const client = createDocClient();
    const input: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: 'CategoryKey = :ckey',
      ExpressionAttributeValues: {
        ':ckey': this.getKey(key as K),
      },
    };
    const request = new QueryCommand(input);
    const response = await client.send(request);
    return (response.Items ?? []) as T[];
  }

  protected abstract getKey(value: K): string;
  protected abstract getSort(value: K): string;
}
