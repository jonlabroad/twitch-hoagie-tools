import { ChannelPointRedemptionEvent } from "../Events/ChannelPointRedemptionEvent";
import { HandlerResult } from "./HandlerResult";

export interface IStreamRewardEventHandler {
    handle(ev: ChannelPointRedemptionEvent): Promise<HandlerResult>;
}
