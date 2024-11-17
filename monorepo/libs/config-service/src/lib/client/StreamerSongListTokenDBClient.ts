import { DynamoDBDocumentClient, GetCommand, GetCommandInput, PutCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { createDocClient } from "../util/DBUtil";

export interface StreamerSongListTokenData {
  timestamp: string;
  token: string;
}

export class StreamerSongListTokenDBClient {
  private tableName: string;
  private client: DynamoDBDocumentClient;

  constructor(tableName: string, dbClient?: DynamoDBDocumentClient) {
    this.client = dbClient ?? createDocClient();
    this.tableName = tableName;
  }
  public async read(): Promise<StreamerSongListTokenData> {
    const input: GetCommandInput = {
      TableName: this.tableName,
      Key: this.createKey(),
    }
    const command = new GetCommand(input);

    console.log({ input });
    const { Item } = await this.client.send(command);
    return Item as StreamerSongListTokenData;
  }

  public async write(tokenData: StreamerSongListTokenData) {
    const input: PutCommandInput = {
      TableName: this.tableName,
      Item: {
        ...this.createKey(),
        ...tokenData,
      }
    }
    const command = new PutCommand(input);

    console.log({ input });
    const response = await this.client.send(command);
    return response;
  }

  private createKey() {
    return {
      CategoryKey: `STREAMERSONGLIST`,
      SubKey: `TOKEN`,
    }
  }
}
