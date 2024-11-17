import { IRewardType } from "./IRewardType";

export type IStreamRewardSchemaVersion = "1.0";

export interface IStreamRewardConfig {
  broadcasterId: string;
  rewards: IStreamReward[];
}

export interface IStreamReward {
  name: string;
  redemptionId: string | undefined;
  enabled: boolean;
  handlerType: IRewardType | undefined;

  metadata: {
    version: IStreamRewardSchemaVersion;
  }
}
