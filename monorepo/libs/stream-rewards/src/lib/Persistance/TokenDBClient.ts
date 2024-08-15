import { IRedemptionInfo, RewardToken } from '../Tokens/RewardToken';
import { ITokenDbClient, RedemptionResult } from './ITokenDBClient';
import {
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  PutCommand,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { createDocClient } from '../util/DBUtil';

export default class TokenDbClient implements ITokenDbClient {
  public static readonly CATEGORY = 'TOKENS';

  private serviceUrl: string | undefined = process.env['DYNAMODB_ENDPOINT'] ?? undefined;
  private tableName: string = process.env['TOKENTABLENAME'] ?? '';

  public async upsertToken(token: RewardToken): Promise<boolean> {
    const item = this.createItem(token.broadcasterId, token);
    const result = await this.writeItem(item);
    return result;
  }

  public async readTokens(
    broadcasterId: string,
  ): Promise<RewardToken[]> {
    const client = createDocClient(this.serviceUrl);

    const queryInput: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: 'CategoryKey = :ck',
      ExpressionAttributeValues: {
        ':ck': this.getKey(broadcasterId),
      },
    };
    const request = new QueryCommand(queryInput);
    console.log({ request });
    const response = await client.send(request);
    return (response?.Items ?? []) as RewardToken[];
  }

  public async readRedemptions(
    broadcasterId: string,
  ): Promise<IRedemptionInfo[]> {
    const client = createDocClient(this.serviceUrl);

    const queryInput: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: 'CategoryKey = :ck',
      ExpressionAttributeValues: {
        ':ck': this.getRedemptionKey(broadcasterId),
      },
    };
    const request = new QueryCommand(queryInput);
    console.log({ request });
    const response = await client.send(request);
    return (response?.Items ?? []) as IRedemptionInfo[];
  }

  public async redeemToken(
    broadcasterId: string,
    ownerId: string,
    key: string,
    redemptionInfo: IRedemptionInfo
  ): Promise<RedemptionResult> {
    try {
      const redemptionItemData = this.createRedemptionItem(redemptionInfo);
      const transactInput: TransactWriteItemsCommandInput = {
        TransactItems: [
          {
            Delete: {
              TableName: this.tableName,
              Key: {
                CategoryKey: {
                  S: this.getKey(broadcasterId),
                },
                SortKey: {
                  S: this.getSort(ownerId, key.toUpperCase()),
                },
              },
              ConditionExpression: 'attribute_exists(CategoryKey) AND attribute_exists(SortKey)',
            },
          },
          {
            Put: {
              TableName: this.tableName,
              Item: {
                CategoryKey: {
                  S: this.getRedemptionKey(broadcasterId),
                },
                SortKey: {
                  S: this.getRedemptionSort(redemptionInfo.redemptionTimestamp, ownerId),
                },
                ...marshall(redemptionItemData),
              },
            },
          },
        ],
      };
      console.log(JSON.stringify(transactInput, null, 2));
      const command = new TransactWriteItemsCommand(transactInput);

      // If token exists, delete the token and add the redemption info
      const client = createDocClient(this.serviceUrl);
      const response = await client.send(command);
      if (response.$metadata.httpStatusCode === 200) {
        return { success: true };
      }
      return { success: false, error: 'Failed to redeem token' };
    } catch (err: any) {
      console.error(err);
      return {
        success: false,
        error: `Failed to redeem token: ${err.message}. ${err.stack}`,
      };
    }
  }

  async writeItem(item: Record<string, any>): Promise<boolean> {
    try {
      const client = createDocClient(this.serviceUrl);
      const input = new PutCommand({
        TableName: this.tableName,
        Item: item,
      });
      console.log(JSON.stringify(input, null, 2));
      const response = await client.send(input);
    } catch (err) {
      console.error(err);
      return false;
    }
    return true;
  }

  private createItem(broadcasterId: string, token: RewardToken) {
    const key = {
      CategoryKey: this.getKey(broadcasterId),
      SortKey: this.getSort(token.ownerId, token.key),
    };

    return {
      ...key,
      ...token,
      grantTimestamp: token.grantTimestamp.getTime(),
      expiryTimestamp: token.expiryTimestamp?.getTime(),
      Expiry: token.expiryTimestamp?.getTime()
        ? token.expiryTimestamp?.getTime() / 1e3
        : 0,
    };
  }

  private createRedemptionItem(redemptionInfo: IRedemptionInfo) {
    return {
      ...redemptionInfo,
      redemptionTimestamp: redemptionInfo.redemptionTimestamp.toISOString(),
    };
  }

  getKey(broadcasterId: string) {
    return `${TokenDbClient.CATEGORY}_${broadcasterId}`.toUpperCase();
  }

  getSort(ownerId: string, tokenKey: string) {
    return `${ownerId}_${tokenKey}`.toUpperCase();
  }

  getRedemptionKey(broadcasterId: string) {
    return `${TokenDbClient.CATEGORY}_REDEMPTION_${broadcasterId}`.toUpperCase();
  }

  getRedemptionSort(redemptionDate: Date, ownerId: string) {
    return `${redemptionDate.toISOString()}_${ownerId}`.toUpperCase();
  }
}
