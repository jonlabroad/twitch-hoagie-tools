import { SecretsProvider } from "@hoagie/secrets-provider";
import { IStreamRewardConfig } from "../IStreamReward";
import RewardConfigDBClient from "../Persistance/RewardConfigDBClient";

export const GetStreamRewardConfigHandler = async (broadcasterId: string): Promise<IStreamRewardConfig | undefined> => {
  await SecretsProvider.init();

  const dbClient = new RewardConfigDBClient();
  const config = await dbClient.read(broadcasterId);
  return config;
}

export const WriteStreamRewardConfigHandler = async (config: IStreamRewardConfig): Promise<boolean> => {
  await SecretsProvider.init();

  const dbClient = new RewardConfigDBClient();
  return dbClient.write(config);
}
