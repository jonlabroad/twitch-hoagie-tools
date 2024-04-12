import { DynamoDBDocumentClient, GetCommandInput } from '@aws-sdk/lib-dynamodb';
import { createDocClient } from '@hoagie/api-util';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

export interface AdminData {
  CategoryKey: string
  SubKey: string

  streamers: Set<string>
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
}
