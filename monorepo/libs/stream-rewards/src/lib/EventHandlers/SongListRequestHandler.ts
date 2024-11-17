import { StreamerSongListClient } from '@hoagie/service-clients';
import { ChatBot } from '../Chat/ChatBot';
import { ChannelPointRedemptionEvent } from '../Events/ChannelPointRedemptionEvent';
import TokenDbClient from '../Persistance/TokenDBClient';
import { IRedemptionInfo, RewardTokenType } from '../Tokens/RewardToken';
import { HandlerResult } from './HandlerResult';
import { IStreamRewardEventHandler } from './IStreamRewardEventHandler';
import { StreamerSongListTokenDBClient } from '@hoagie/config-service';
import { createDocClient } from '../util/DBUtil';

// TODO this can be part of the persisted configuration
interface SongListRequestConfig {
  validTokenTypeKey: RewardTokenType;
}

const config: SongListRequestConfig = {
  validTokenTypeKey: "sub",
};

export interface SongListRequest {
  type: string;
  text: string;
  userId: string;
  userName: string;
  broadcasterId: string;
  broadcasterName: string;
}

export class SongListRequestHandler implements IStreamRewardEventHandler {
  private typeText: string;
  private chatBot: ChatBot;

  constructor(typeText: string, chatBot: ChatBot) {
    this.typeText = typeText;
    this.chatBot = chatBot;
  }

  public async handle(ev: ChannelPointRedemptionEvent): Promise<HandlerResult> {
    console.log({ type: this.typeText, handlingSongListRequest: ev });

    const redemptionTime =new Date(ev.redeemed_at);
    const redemptionInfo: IRedemptionInfo = {
      redemptionTimestamp: redemptionTime,
      broadcasterId: ev.broadcaster_user_id,
      ownerId: ev.user_id,
    };
    const tokenDbClient = new TokenDbClient();
    const redemptionResult = await tokenDbClient.redeemToken(
      ev.broadcaster_user_id,
      ev.user_id,
      config.validTokenTypeKey,
      redemptionInfo,
    );

    if (redemptionResult.success) {
      const songListRequest = this.createSongListRequest(ev);

      const apiSuccess = await this.createSongListRequestUsingApi(songListRequest);
      if (!apiSuccess) {
        await this.chatBot.sendMessage(`!ll ${songListRequest.text}`);
      }

      return {
        success: true,
      };
    }

    console.log({ redemptionFailed: redemptionResult });
    return {
      success: false,
      error: `Failed to redeem token: ${redemptionResult.error}`,
    }
  }

  private createSongListRequest(ev: ChannelPointRedemptionEvent): SongListRequest {
    return {
      type: this.typeText,
      text: ev.user_input,
      userId: ev.user_id,
      userName: ev.user_name,
      broadcasterId: ev.broadcaster_user_id,
      broadcasterName: ev.broadcaster_user_name,
    };
  }

  private async createSongListRequestUsingApi(request: SongListRequest): Promise<boolean> {
    try {
      const tableName = process.env['TABLENAME'];
      if (!tableName) {
        console.error('TABLENAME not set');
        return false;
      }

      const tokenDbClient = new StreamerSongListTokenDBClient(tableName);
      const sslToken = await tokenDbClient.read();
      if (!sslToken) {
        console.error('No token found');
        return false;
      }

      const client = new StreamerSongListClient(sslToken.token);
      const sslStreamerId = await client.getSslUserId(request.broadcasterName);
      if (!sslStreamerId) {
        console.error('No streamer id found');
        return false;
      }

      console.log({ sslStreamerId, text: request.text, userName: request.userName })
      const success = await client.nonlistSongRequest(sslStreamerId, request.userName, request.text, );
      return success;
    } catch(err) {
      console.error('Failed to create song list request using the API');
      console.error(err);
      return false;
    }
  }
}
