import { DynamoDBDocumentClient, GetCommandInput, PutCommand, PutCommandInput, UpdateCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import { createDocClient } from '@hoagie/api-util';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

export interface AdminData {
  CategoryKey: string
  SubKey: string

  streamers: Set<string>
}

export interface UserData {
  userId: string
  streamerIds: string[]
}

export class ConfigDBClient {
  private tableName: string;
  private client: DynamoDBDocumentClient;

  constructor(tableName: string) {
    this.client = createDocClient();
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

  private getUserDataKey(userId: string, field: string) {
    return {
      CategoryKey: `USERDATA_${userId}`,
      SubKey: field,
    }
  }
}
