import {
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { createDocClient } from '../db/DBUtil';

export interface ModsDataV2 {
  mods: string[];
  channelId: string;
}

export default class ModsDbClientV2 {
  public static readonly CATEGORY = 'CHANNELADMIN';
  public static readonly SORT_KEY = 'mods';

  private broadcasterId: string;
  private tableName: string;

  constructor(tableName: string, props: { broadcasterId: string }) {
    this.tableName = tableName;
    this.broadcasterId = props.broadcasterId;
  }

  public async readMods(): Promise<ModsDataV2 | undefined> {
    const client = createDocClient();

    const request: GetCommand = new GetCommand({
      TableName: this.tableName,
      Key: {
        CategoryKey: this.getKey(this.broadcasterId),
        SubKey: ModsDbClientV2.SORT_KEY,
      },
    });
    const response = await client.send(request);
    console.log({ mods: response.Item });
    return response?.Item as ModsDataV2 | undefined;
  }

  public async writeMods(mods: string[]) {
    try {
      const client = createDocClient();
      const input = new PutCommand({
        TableName: this.tableName,
        Item: {
          CategoryKey: this.getKey(this.broadcasterId),
          SubKey: ModsDbClientV2.SORT_KEY,
          mods,
          channel: this.broadcasterId,
        },
      });
      await client.send(input);
    } catch (err) {
      console.error(err);
    }
  }

  public async addMod(username: string) {
    try {
      const client = createDocClient();
      const input = new UpdateCommand({
        TableName: this.tableName,
        Key: {
          CategoryKey: this.getKey(this.broadcasterId),
          SubKey: ModsDbClientV2.SORT_KEY,
        },
        ConditionExpression: 'not(contains(#listAttr, :newItem))',
        UpdateExpression:
          'SET #listAttr = list_append(if_not_exists(#listAttr, :emptyList), :newItem)',
        ExpressionAttributeNames: {
          '#listAttr': 'mods',
        },
        ExpressionAttributeValues: {
          ':newItem': [username],
          ':emptyList': [],
        },
      });
      await client.send(input);
    } catch (err) {
      console.error(err);
    }
  }

  public async deleteMod(username: string, indexToRemove: number) {
    try {
      const client = createDocClient();
      const input = new UpdateCommand({
        TableName: this.tableName,
        Key: {
          CategoryKey: this.getKey(this.broadcasterId),
          SubKey: ModsDbClientV2.SORT_KEY,
        },
        ConditionExpression: `#listAttr[${indexToRemove}] = :valueToRemove`,
        UpdateExpression: `REMOVE #listAttr[${indexToRemove}]`,
        ExpressionAttributeNames: {
          '#listAttr': 'mods',
        },
        ExpressionAttributeValues: {
          ':valueToRemove': username,
        },
      });
      await client.send(input);
    } catch (err) {
      console.error(err);
    }
  }

  getKey(channel: string) {
    return `${ModsDbClientV2.CATEGORY}_${channel.toLowerCase()}`;
  }
}
