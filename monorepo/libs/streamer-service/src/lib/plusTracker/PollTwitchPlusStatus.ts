import { SecretsProvider } from '@hoagie/secrets-provider';
import { TwitchPlusClient } from './TwitchPlusClient';
import { TwitchPlusStatusDBClient } from './TwitchPlusStatusDBClient';
import { StreamerConfigDBClient } from '@hoagie/streamer-service';
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

const doWritePreviousMonths = false;
const snsTopicArn = "arn:aws:sns:us-east-1:796987500533:hoagietools-prod-notifications";

export const pollTwitchPlusStatus = async () => {
  await SecretsProvider.init();

  const snsClient = new SNSClient({
    region: 'us-east-1',
  });

  const tableName = process.env['TABLENAME'];
  if (!tableName) {
    throw new Error('No table name provided');
  }

  const client = new TwitchPlusClient();

  const streamerConfigDBClient = new StreamerConfigDBClient(tableName);
  const allConfigs = await streamerConfigDBClient.queryAll({});
  console.log({ allConfigs });
  const channelIds = allConfigs
    .filter((config) => config.twitchPlus?.trackingEnabled)
    .map((config) => config.broadcasterId);

  const errors: {
    broadcasterId: string;
    error: string;
  }[] = [];

  await Promise.all(
    channelIds.map(async (channelId) => {
      if (!channelId) {
        return;
      }

      try {
        const body = await client.getPlusData(channelId);

        // Get the current month data and create an entry
        const currentMonth = new Date().getUTCMonth();
        const currentYear = new Date().getUTCFullYear();

        const currentMonthStatus =
          body.data.plusStatus.partnerPlusProgram.subPoints.find(
            (s) => s.month === currentMonth + 1 && s.year === currentYear
          );
        if (!currentMonthStatus) {
          throw new Error(
            'No current month status found for channel Id: ' + channelId
          );
        }

        const dbClient = new TwitchPlusStatusDBClient(
          channelId,
          process.env['TABLENAME'] ?? 'NO_TABLE_NAME'
        );

        console.log(
          `Writing results for ${channelId} for month ${
            currentMonth + 1
          } year ${currentYear}`
        );

        await dbClient.set({
          broadcasterId: channelId,
          month: currentMonth + 1,
          year: new Date().getUTCFullYear(),
          timestamp: new Date().toISOString(),
          value: currentMonthStatus.count,
        });

        if (doWritePreviousMonths) {
          await Promise.all(
            body.data.plusStatus.partnerPlusProgram.subPoints
              .filter(
                (s) => !(s.month === currentMonth + 1 && s.year === currentYear)
              )
              .map(async (status) => {
                const endOfMonthTimestamp = getLastDateOfMonth(
                  status.year,
                  status.month
                ).toISOString();
                console.log(
                  `Writing results for ${channelId} for month ${status.month} year ${status.year}`
                );
                await dbClient.set({
                  broadcasterId: channelId,
                  month: status.month,
                  year: status.year,
                  timestamp: endOfMonthTimestamp,
                  value: status.count,
                });
              })
          );
        }
      } catch (e: any) {
        errors.push({
          broadcasterId: channelId,
          error: e.message,
        });
      }
    })
  );

  if (errors.length > 0) {
    console.error('Errors occurred while polling Twitch Plus status');
    console.error(errors);

    // Publish to SNS topic
    await snsClient.send(new PublishCommand({
      TopicArn: snsTopicArn,
      Message: JSON.stringify(errors
        .map((error) => ({
          broadcasterId: error.broadcasterId,
          error: error.error,
        }))
      ),
      Subject: 'Errors occurred while polling Twitch Plus status',
    }));

  }
};

const getLastDateOfMonth = (year: number, monthStartingAt1: number) => {
  const firstOfNextMonth = new Date(year, monthStartingAt1 % 12, 1, 0, 0, 0, 0);
  return new Date(firstOfNextMonth.getTime() - 1e3);
};
