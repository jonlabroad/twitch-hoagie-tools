import * as tmi from "tmi.js"
import { SubGiftProcessor } from "./SubGiftProcessor"
import { SubProcessor } from "./SubProcessor"
import { CheerProcessor } from "./CheerProcessor"
import { ChatMessageProcessor } from "./ChatMessageProcessor"

export interface ChatEventType {
    version: string,
    id: string,
    'detail-type': "message" | "cheer" | "subscription" | "resub" | "subgift",
    source: string,
    account: string,
    time: string,
    region: string,
    resources: any[],
}

export interface SubGiftEvent extends ChatEventType {
    'detail-type': "subgift",
    detail: {
        channel: string,
        username: string,
        streakMonths: number,
        recipient: string,
        methods: tmi.SubMethods,
        userstate: tmi.SubGiftUserstate,
    }
}

export interface SubEvent extends ChatEventType {
    'detail-type': "subscription",
    detail: {
        channel: string,
        username: string,
        methods: tmi.SubMethods
        message: string
        userstate: tmi.SubUserstate,
    }
}

export interface ResubEvent extends ChatEventType {
    'detail-type': "resub",
    detail: {
        channel: string,
        username: string,
        months: number,
        userstate: tmi.SubUserstate,
        message: string
        methods: tmi.SubMethods
    }
}

export interface CheerEvent extends ChatEventType {
    'detail-type': "cheer",
    detail: {
        channel: string,
        userstate: tmi.ChatUserstate,
        message: string
    }
}

export interface MessageEvent extends ChatEventType {
    'detail-type': "message",
    detail: {
        channel: string,
        userstate: tmi.ChatUserstate,
        message: string
    }
}

export class ChatEventProcessor {
    public static async process(event: ChatEventType) {
        switch (event["detail-type"]) {
            case "subgift":
                await SubGiftProcessor.process(event as SubGiftEvent)
                break;
            case "subscription":
                await SubProcessor.process(event as SubEvent)
                break;
            case "resub":
                await SubProcessor.process(event as ResubEvent)
                break;
            case "cheer":
                await CheerProcessor.process(event as CheerEvent)
                break;
            case "message":
                await ChatMessageProcessor.process(event as MessageEvent)
                break;
            default:
                console.error(`Unknown event type: ${event["detail-type"]}`);
        }
    }
}

export function getChannelName(tmiChannel: string) {
    return tmiChannel.replace("#", "");
}