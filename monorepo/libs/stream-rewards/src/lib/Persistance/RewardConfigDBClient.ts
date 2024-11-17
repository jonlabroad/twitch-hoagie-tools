import { IRedemptionInfo, RewardToken } from '../Tokens/RewardToken';
import { ITokenDbClient, RedemptionResult } from './ITokenDBClient';
import {
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  GetCommand,
  GetCommandInput,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { createDocClient } from '../util/DBUtil';
import { IStreamReward, IStreamRewardConfig } from '../IStreamReward';

export default class RewardConfigDBClient {
  public static readonly CATEGORY = 'STREAMREWARDS_CONFIG';

  private serviceUrl: string | undefined = process.env['DYNAMODB_ENDPOINT'] ?? undefined;
  private tableName: string = process.env['TABLENAME'] ?? '';

  public async read(
    broadcasterId: string,
  ): Promise<IStreamRewardConfig | undefined> {
    const client = createDocClient(this.serviceUrl);

    const input: GetCommandInput = {
      TableName: this.tableName,
      Key: {
        CategoryKey: this.getKey(broadcasterId),
        SubKey: this.getSort(),
      },
    };
    console.log({ input });
    const request = new GetCommand(input);
    const response = await client.send(request);
    return (response?.Item) as IStreamRewardConfig | undefined;
  }

  async write(config: IStreamRewardConfig): Promise<boolean> {
    try {
      const client = createDocClient(this.serviceUrl);
      const item = this.createItem(config.broadcasterId, config);
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

  private createItem(broadcasterId: string, config: IStreamRewardConfig) {
    const key = {
      CategoryKey: this.getKey(broadcasterId),
      SubKey: this.getSort(),
    };

    return {
      ...key,
      ...config,
    };
  }

  getKey(broadcasterId: string) {
    return `${RewardConfigDBClient.CATEGORY}_${broadcasterId}`.toUpperCase();
  }

  getSort() {
    return `PRIMARY`.toUpperCase();
  }
}
