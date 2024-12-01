import { SecretsProvider } from '@hoagie/secrets-provider';
import { TwitchPlusClient } from './TwitchPlusClient';
import { TwitchPlusStatusDBClient } from './TwitchPlusStatusDBClient';
import { StreamerConfigDBClient } from '@hoagie/streamer-service';

export const pollTwitchPlusStatus = async () => {
  await SecretsProvider.init();

  const tableName = process.env['TABLENAME'];
  if (!tableName) {
    throw new Error('No table name provided');
  }

  const client = new TwitchPlusClient();

  const streamerConfigDBClient = new StreamerConfigDBClient(tableName);
  const allConfigs = await streamerConfigDBClient.queryAll({});
  console.log({ allConfigs });
  const channelIds = allConfigs.filter((config) => config.twitchPlus?.trackingEnabled).map((config) => config.broadcasterId);

  await Promise.all(
    channelIds.map(async (channelId) => {
      if (!channelId) {
        return;
      }

      const body = await client.getPlusData(channelId);

      // Get the current month data and create an entry
      const currentMonth = new Date().getUTCMonth();
      const currentYear = new Date().getUTCFullYear();

      const currentMonthStatus =
        body.data.plusStatus.partnerPlusProgram.subPoints.find(
          (s) => s.month === currentMonth + 1 && s.year === currentYear
        );
      if (!currentMonthStatus) {
        throw new Error('No current month status found for channel Id: ' + channelId);
      }

      const dbClient = new TwitchPlusStatusDBClient(
        channelId,
        process.env['TABLENAME'] ?? 'NO_TABLE_NAME'
      );

      console.log(`Writing results for ${channelId} for month ${currentMonth + 1} year ${currentYear}`);

      await dbClient.set({
        broadcasterId: channelId,
        month: currentMonth + 1,
        year: new Date().getUTCFullYear(),
        timestamp: new Date().toISOString(),
        value: currentMonthStatus.count,
      });
    })
  );
};
