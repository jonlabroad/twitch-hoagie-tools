import HoagieWebsocketClient, { HoagieEvent } from "./HoagieWebsocketClient";

export class HoagieSocketEventListener {
  client: HoagieWebsocketClient;
  listeners: Record<string, ((data: any) => void)[]> = {};

  constructor() {
    this.client = new HoagieWebsocketClient(
      this.onMessage.bind(this),
      this.onConnectionChange.bind(this)
    );
  }

  public addListener(messageType: string, callback: (data: any) => void) {
    const messageTypeLower = messageType.toLowerCase();
    if (!this.listeners[messageTypeLower]) {
      this.listeners[messageTypeLower] = [];
    }
    this.listeners[messageTypeLower].push(callback);
  }

  public subscribeDono(broadcasterId: number) {
    this.client.send(
      JSON.stringify({
        action: "subscribe",
        topic: `dono.${broadcasterId}`,
      })
    );
  }

  public ping() {
    this.client.send(
      JSON.stringify({
        action: "ping",
      })
    );
  }

  public getAllConnections() {
    this.client.send(
      JSON.stringify({
        action: "getallconnections",
      })
    );
  }

  public connect() {
    this.client.connect();
  }

  public disconnect() {
    this.client.disconnect();
  }

  private onMessage(event: { data: string }) {
    console.log({ event });
    try {
      if (event.data !== "pong") {
        const parsed = JSON.parse(event.data);
        const type = parsed.type;
        this.callListeners(type, parsed.data);
      }
    } catch (err) {
      console.log(`Don't know how to process message: ${event.data}`);
    }
  }

  private onConnectionChange(connected: boolean) {
    if (connected) {
      this.onConnect();
    } else {
      this.onDisconnect();
      //console.log("Disconnected, attempting to reconnect");
      //this.client.connect();
      console.log("Disconnected, not attempting to reconnect");
    }
  }

  private onConnect() {
    this.callListeners("connect", {});
  }

  private onDisconnect() {
    this.callListeners("disconnect", {});
  }

  private callListeners(type: string, data: any) {
    const listeners = this.listeners[type.toLowerCase()] ?? [];
    listeners.forEach((listener) => listener(data));
  }
}
