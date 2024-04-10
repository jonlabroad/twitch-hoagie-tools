import { APIGatewayEvent, EventBridgeEvent } from 'aws-lambda';
//import { OnModsChanged } from '@hoagie/config-service';

const version = "1.0.0";

export async function onModsChanged(eventBridgeEvent: EventBridgeEvent<any, any>) {
  if (!process.env.TABLENAME) {
    throw new Error('TABLENAME environment variable is required');
  }

  console.log("HAI");

  // Read mod tables

  // See if we need to write any new config objects to the config table

  // Check if new streamers need to be added to their config

}
