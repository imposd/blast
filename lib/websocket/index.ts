import { EventEmitter } from "events";
import WebSocket from "ws";
import { isProd } from "../consts";

interface Options {
  reconnectTime: number;
  reconnectCount: number;
}

interface Data {
  token: string;
}

const SWARM_URL = "wss://swarm-dev.hiven.io/socket?encoding=json&compression=text_json?encoding=json";

export class WS extends EventEmitter {
  private heartbeatInterval: NodeJS.Timeout | undefined;
  private reconnectTimeout: NodeJS.Timeout | undefined;
  private lastHeartBeatAck?: number;
  private lastHeartbeat?: number;
  private options: Options;
  private ws: WebSocket | undefined;
  private token: string;

  constructor(options: Options = { reconnectTime: 10000, reconnectCount: 3 }) {
    super();
    this.token = this.token;
    this.reconnectTimeout = null;
    this.options = options;
  }

  async send<T extends Data>(op: number, data?: T): Promise<void> {
    if (this.ws?.readyState != WebSocket.OPEN) return;
    if (op == 2) this.token = data.token;
    return this.ws?.send(JSON.stringify({ op: op, d: data }));
  }

  async sendHeartbeat(code: number): Promise<void> {
    this.heartbeatInterval = setInterval(async () => this.send(3), code);
  }

  async create() {
    return new Promise<void>((resolve, reject) => {
      this.ws = new WebSocket(SWARM_URL);

      this.ws?.on("open", () => {
        if (isProd === true) console.log("[Blast]: Established connection to Hiven.");
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
      });

      // this.ws?.on("close", async () => {
      //   setTimeout(async () => {
      //     await this.ws?.removeAllListeners();
      //     await this.send(2, { token: this.token });
      //   }, this.options.reconnectTime);
      // });

      this.ws?.on("message", async (data: any) => {
        const body = JSON.parse(data);
        if (body.op == 1 && body.d && body.d.hbt_int) await this.sendHeartbeat(body.d.hbt_int);
      });

      this.reconnectTimeout = setTimeout(() => this.destroy(true), this.options.reconnectTime);
    });
  }

  async reconnect() {}

  async destroy(reconnect: boolean = true) {
    if (!this.ws) return;
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    try {
      if (this.ws?.readyState !== WebSocket.CLOSED) {
        await this.ws?.removeAllListeners();
        if (reconnect && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.close(4200, "[Blast]: Reconnecting");
        } else {
          this.ws.close();
        }
      }
    } catch (err) {
      if (isProd === true) return console.log("[Blast]: An error has occurred with the websocket connection.");
    }
    this.ws = null;
  }

  get ping(): number {
    if (!this.lastHeartbeat || !this.lastHeartBeatAck) return 0;

    return this.lastHeartBeatAck - this.lastHeartbeat;
  }
}
