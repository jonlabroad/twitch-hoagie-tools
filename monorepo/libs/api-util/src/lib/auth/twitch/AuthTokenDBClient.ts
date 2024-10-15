import { DynamoDBDocumentClient, GetCommandInput, PutCommand, PutCommandInput, QueryCommand, QueryCommandInput, UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { TwitchAccessToken } from '@hoagie/service-clients';
import { createDocClient } from '../../util/DBUtil';

export type TokenCategory = "USER" | "BOT" | "REWARDS";

export class AuthTokenDBClient {
  private tableName: string;
  private client: DynamoDBDocumentClient;

  constructor(tableName: string, dbClient?: DynamoDBDocumentClient) {
    this.client = dbClient ?? createDocClient();
    this.tableName = tableName;
  }

  public async saveAccessToken(userId: string, accessToken: TwitchAccessToken, tokenCategory: TokenCategory) {
    const input: PutCommandInput = {
      TableName: this.tableName,
      Item: {
        ...this.getAccessTokenKey(userId, tokenCategory),
        ...accessToken,
      }
    }
    const command = new PutCommand(input);

    console.log({ input });
    const response = await this.client.send(command);
    return response;
  }

  public async getAccessToken(userId: string, tokenCategory: string): Promise<TwitchAccessToken | undefined> {
    const input: GetCommandInput = {
      TableName: this.tableName,
      Key: this.getAccessTokenKey(userId, tokenCategory),
    }
    console.log(JSON.stringify(input));
    const command = new GetCommand(input);

    const { Item } = await this.client.send(command);
    console.log({ Item });
    return Item as TwitchAccessToken;
  }

  public async getAccessTokens(userId: string): Promise<TwitchAccessToken[]> {
    const input: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: "#CategoryKey = :categoryKey",
      ExpressionAttributeNames: {
        "#CategoryKey": "CategoryKey",
      },
      ExpressionAttributeValues: {
        ":categoryKey": this.getCategoryKey(userId),
      }
    }
    console.log(JSON.stringify(input));
    const command = new QueryCommand(input);

    const { Items } = await this.client.send(command);
    return Items as TwitchAccessToken[];
  }

  private getAccessTokenKey(userId: string, accessCategory: string) {
    return {
      CategoryKey: this.getCategoryKey(userId),
      SubKey: `TOKEN_${accessCategory}`.toUpperCase(),
    };
  }

  private getCategoryKey(userId: string) {
    return `USERACCESS_${userId}`.toUpperCase();
  }
}
