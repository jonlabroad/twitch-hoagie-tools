import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { createDocClient } from '../util/DBUtil';

export interface SongEvalConfigData {
  whitelist: string[] | undefined;
}

export class SongEvalDbClient {
  public static readonly CATEGORY = 'SONGEVAL';
  private readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public async read(channelId: string): Promise<SongEvalConfigData | undefined> {
    const client = createDocClient();

    const input = {
      TableName: this.tableName,
      Key: {
        CategoryKey: this.getKey(channelId),
        SubKey: this.getSort(),
      },
    };

    console.log({ input });
    const request: GetCommand = new GetCommand(input);
    const response = await client.send(request);
    console.log(response);
    return response?.Item as SongEvalConfigData | undefined;
  }

  public async addWhitelistWord(
    channelId: string,
    word: string
  ): Promise<void> {
    try {
      const client = createDocClient();
      const key = {
        CategoryKey: this.getKey(channelId),
        SubKey: this.getSort(),
      };
      const input = {
        TableName: this.tableName,
        Key: key,
        UpdateExpression: 'ADD whitelist :word',
        ExpressionAttributeValues: {
          ':word': new Set([word]),
        },
      };
      console.log({ input });
      const command = new UpdateCommand(input);
      await client.send(command);
    } catch (err) {
      console.error(err);
    }
  }

  public async removeWhitelistWord(
    channelId: string,
    word: string
  ): Promise<void> {
    try {
      const client = createDocClient();
      const key = {
        CategoryKey: this.getKey(channelId),
        SubKey: this.getSort(),
      };
      const input = {
        TableName: this.tableName,
        Key: key,
        UpdateExpression: 'DELETE whitelist :word',
        ExpressionAttributeValues: {
          ':word': new Set([word]),
        },
      };
      console.log({ input });
      const command = new UpdateCommand(input);
      await client.send(command);
    } catch (err) {
      console.error(err);
    }
  }

  getKey(channelId: string) {
    return `${SongEvalDbClient.CATEGORY}_${channelId}`;
  }

  getSort() {
    return `CONFIG`;
  }
}
