import { ChannelPointRedemptionEvent } from '../Events/ChannelPointRedemptionEvent';
import TokenDbClient from '../Persistance/TokenDBClient';
import { IRedemptionInfo, RewardTokenType } from '../Tokens/RewardToken';
import { HandlerResult } from './HandlerResult';
import { IStreamRewardEventHandler } from './IStreamRewardEventHandler';

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
  public typeText: string;

  constructor(typeText: string) {
    this.typeText = typeText;
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
      // Future: Attempt to use the API, if token is invalid, resort to chat commands
      const songListRequest = this.createSongListRequest(ev);
      // TODO execute the song list request

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
}
