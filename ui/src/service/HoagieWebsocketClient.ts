import { ChatMessage } from "../components/chat/SimpleChatDisplay";
import ChatParser from "./ChatParser";

const hoagieWebsocketUrl = "wss://ws-prod.hoagieman.net";

interface HoagieEvent<T = any> {
  topic: string;
  type: string;
  data: T;
}

export default class HoagieWebsocketClient {
  ws: any = undefined;
  connected: boolean = false;
  onMessage: (msg: string) => void;
  onConnectionChange: (connected: boolean) => void;

  constructor(
    onMessage: (msg: string) => void,
    onConnectionChange: (connected: boolean) => void
  ) {
    this.onMessage = onMessage;
    this.onConnectionChange = onConnectionChange;
  }

  subscribeDono(broadcasterId: number) {
    this.ws.send(JSON.stringify({
        action: "subscribe",
        topic: `dono.${broadcasterId}`
    }));
  }

  ping() {
    this.ws.send(JSON.stringify({
        action: "ping"
    }));
  }

  connect() {
    console.log(`Connecting to ${hoagieWebsocketUrl}`);
    if (!this.connected) {
      this.ws = new WebSocket(hoagieWebsocketUrl);
      this.ws.onopen = this.onConnect.bind(this);
      this.ws.onclose = this.onDisconnect.bind(this);
      this.ws.onmessage = (event: HoagieEvent) => {
        const msg = event.data;
        this.onMessage(msg);
      };
    }
  }

  disconnect() {
    this.ws.close();
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
