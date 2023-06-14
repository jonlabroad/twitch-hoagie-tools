import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import ChatParser from "./ChatParser";

const twitchChatUrl = "wss://irc-ws.chat.twitch.tv:443";

interface ChatEvent {
    data: string
}

export default class TwitchChatClient {
    username: string
    channel: string
    oauthToken: string

    ws: any = undefined;
    connected: boolean = false;
    onMessage: (msg: ChatMessage) => void
    onConnectionChange: (connected: boolean) => void

    constructor(username: string, channel: string, oauthToken: string, onMessage: (msg: ChatMessage) => void, onConnectionChange: (connected: boolean) => void) {
        this.username = username;
        this.channel = channel;
        this.oauthToken = oauthToken;
        this.onMessage = onMessage;
        this.onConnectionChange = onConnectionChange;
    }

    connect() {
        console.log(`Connecting to ${twitchChatUrl}`);
        if (!this.connected) {
            this.ws = new WebSocket(twitchChatUrl);
            this.ws.onopen = this.onConnect.bind(this);
            this.ws.onclose = this.onDisconnect.bind(this);
            this.ws.onmessage = (event: ChatEvent) => {
                this.pong(event.data);
                const msg = event.data;
                const parsedMessage = ChatParser.parse(msg);
                if (parsedMessage) {
                    this.onMessage(parsedMessage);
                }
            } 
        } 
    }

    disconnect() {
        this.ws.close();
    }

    onConnect() {
        console.log("connected");
        console.log(`PASS oauth:${this.oauthToken}`.replace(this.oauthToken, "*********"));
        this.ws.send(`PASS oauth:${this.oauthToken}`);
        console.log(`NICK ${this.username}`);
        this.ws.send(`NICK ${this.username}`);

        this.ws.send(`JOIN #${this.channel}`);

        console.log(`CONNECTED to ${this.channel}`);
        this.connected = true;
        this.onConnectionChange(this.connected);
    }

    onDisconnect() {
        console.log(`DISCONNECTED from ${this.channel}`);
        this.connected = false;
        this.onConnectionChange(this.connected);
    }

    pong(message: string) {
        if (message.trim() === `PING :tmi.twitch.tv`) {
            console.log("PONG :tmi.twitch.tv");
            this.ws.send("PONG :tmi.twitch.tv");
        }
    }

    sendChatMessage(message: string) {
        this.ws.send(`PRIVMSG #${this.channel} :${message}`);
    }
}