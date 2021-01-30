import { EventEmitter } from "ws";
import { WS } from "./websocket";

interface Options {
  type: string;
}

export declare let ws: WS;

export interface Client {
  ws: WS;
  token?: string;
  options: Options;
}

export class Client extends EventEmitter {
  constructor(options: Options = { type: "bot" }) {
    super();

    this.options = options;
    this.ws = new WS();
  }

  async login(token: string): Promise<void> {
    switch (this.options.type) {
      case "bot":
        this.token = `Bot ${token}`;
      case "user":
        this.token = token;
      default:
        this.token = token;
    }

    // Create a connection to the websocket, then authenticate with ws.
    await this.ws.create().then(async () => await this.ws.send(2, { token: this.token }));
  }

  destory(): void {
    this.ws.destroy();
  }
}
