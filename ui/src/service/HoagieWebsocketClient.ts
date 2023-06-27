import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import ChatParser from "./ChatParser";

const hoagieWebsocketUrl = "wss://ws-prod.hoagieman.net";

export interface HoagieEvent {
  topic: string;
  type: string;
  data: string;
}

export default class HoagieWebsocketClient {
  ws: any = undefined;
  connected: boolean = false;
  onMessage: (msg: HoagieEvent) => void;
  onConnectionChange: (connected: boolean) => void;

  constructor(
    onMessage: (msg: HoagieEvent) => void,
    onConnectionChange: (connected: boolean) => void
  ) {
    this.onMessage = onMessage;
    this.onConnectionChange = onConnectionChange;
  }

  connect() {
    console.log(`Connecting to ${hoagieWebsocketUrl}`);
    if (!this.connected) {
      this.ws = new WebSocket(hoagieWebsocketUrl);
      this.ws.onopen = this.onConnect.bind(this);
      this.ws.onclose = this.onDisconnect.bind(this);
      this.ws.onmessage = (event: HoagieEvent) => {
        this.onMessage(event);
      };
    }
  }

  disconnect() {
    this.ws.close();
  }

  send(msg: string) {
    console.log({sending: msg});
    this.ws.send(msg);
  }

  onConnect() {
    console.log("Connected to HoagieSockets");
    this.connected = true;
    this.onConnectionChange(true);
  }

  onDisconnect() {
    console.log(`Disconnected from HoagieSockets`);
    this.connected = false;
    this.onConnectionChange(false);
  }
}
