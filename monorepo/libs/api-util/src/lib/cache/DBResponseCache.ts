import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const defaultExpirySec = 48 * 60 * 60;

export class DBResponseCache {
  private client: DynamoDBDocumentClient;
  private tableName: string;
  private cacheName: string;

  constructor(documentClient: DynamoDBDocumentClient, cacheName: string, tableName: string) {
    this.client = documentClient;
    this.cacheName = cacheName;
    this.tableName = tableName;
  }

  public async get<T>(key: string, version: string): Promise<T | null> {
    try {
      const request: GetCommand = new GetCommand({
        TableName: this.tableName,
        Key: {
          CategoryKey: this.createCachePrimaryKey(key),
          SubKey: this.createCacheSortKey(version),
        },
      });
      const response = await this.client.send(request);
      const item = response?.Item;
      return item?.['Value'] as T;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async set<T>(key: string, value: T, version: string, expirySec?: number) {
    try {
      const input = new PutCommand({
        TableName: this.tableName,
        Item: {
          CategoryKey: this.createCachePrimaryKey(key),
          SubKey: this.createCacheSortKey(version),
          Value: value,
          ExpirationTTL: Math.floor(Date.now() / 1e3 + (expirySec ?? defaultExpirySec))
        },
      });
      //console.log(input);
      return await this.client.send(input);
    } catch (err) {
      console.error(err);
    }
    return null;
  }

  private createCachePrimaryKey(key: string) {
    return `APICACHE_${this.cacheName}_${key}`.toUpperCase();
  }

  private createCacheSortKey(version: string) {
    return `${version.toLowerCase()}`;
  }
}
