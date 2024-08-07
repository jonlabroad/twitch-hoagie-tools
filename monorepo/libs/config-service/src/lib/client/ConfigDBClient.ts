import { DynamoDBDocumentClient, GetCommandInput, PutCommand, PutCommandInput, UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { TwitchAccessToken } from '@hoagie/service-clients';
import { createDocClient } from '../util/DBUtil';

export interface AdminData {
  CategoryKey: string
  SubKey: string

  streamers: Set<string>
}

export interface UserData {
  userId: string
  streamerIds: string[]
}

export type TokenCategory = "USER" | "BOT";

export class ConfigDBClient {
  private tableName: string;
  private client: DynamoDBDocumentClient;

  constructor(tableName: string, dbClient?: DynamoDBDocumentClient) {
    this.client = dbClient ?? createDocClient();
    this.tableName = tableName;
  }
  public async getAdminData(): Promise<AdminData> {
    const input: GetCommandInput = {
      TableName: this.tableName,
      Key: {
        CategoryKey: `DonoWatch_admin`,
        SubKey: `config`,
      },
    }
    const command = new GetCommand(input);

    console.log({ input });
    const { Item } = await this.client.send(command);
    return Item as AdminData;
  }

  public async setUserData(userId: string, data: UserData) {
    const input: PutCommandInput = {
      TableName: this.tableName,
      Item: {
        ...this.getUserDataKey(userId, "CONFIG"),
        ...data,
      }
    }
    const command = new PutCommand(input);

    console.log({ input });
    const response = await this.client.send(command);
    return response;
  }

  public async getUserData(userId: string): Promise<UserData> {
    const input: GetCommandInput = {
      TableName: this.tableName,
      Key: this.getUserDataKey(userId, "CONFIG"),
    }
    const command = new GetCommand(input);

    console.log({ input });
    const { Item } = await this.client.send(command);
    return Item as UserData;
  }

  public async setUserStreamerIds(userId: string, streamerIds: string[]) {
    return this.updateSingleField(userId, "streamerIds", streamerIds);
  }

  public async updateSingleField<T>(userId: string, fieldName: string, value: T) {
    const input: UpdateCommandInput = {
      TableName: this.tableName,
      Key: this.getUserDataKey(userId, "CONFIG"),
      UpdateExpression: `SET ${fieldName} = :value`,
      ExpressionAttributeValues: {
        ':value': value,
      },
    };
    const command = new UpdateCommand(input);

    console.log({ input });
    const response = await this.client.send(command);
    return response;
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

  public async getAccessToken(userId: string, tokenCategory: string): Promise<TwitchAccessToken> {
    const input: GetCommandInput = {
      TableName: this.tableName,
      Key: this.getAccessTokenKey(userId, tokenCategory),
    }
    const command = new GetCommand(input);

    const { Item } = await this.client.send(command);
    return Item as TwitchAccessToken;
  }

  private getUserDataKey(userId: string, field: string) {
    return {
      CategoryKey: `USERDATA_${userId}`,
      SubKey: field,
    }
  }

  private getAccessTokenKey(userId: string, accessCategory: string) {
    return {
      CategoryKey: `USERACCESS_${userId}`.toUpperCase(),
      SubKey: `TOKEN_${accessCategory}`.toUpperCase(),
    };
  }
}
