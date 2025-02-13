import { WebSocket, WebSocketServer } from 'ws';
import { RealtimeClient } from '@openai/realtime-api-beta';

export class RealtimeRelay {
  private apiKey: string;
  private sockets: WeakMap<WebSocket, RealtimeClient>;
  private wss: WebSocketServer | null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.sockets = new WeakMap();
    this.wss = null;
  }

  listen(port: number): void {
    this.wss = new WebSocketServer({ port });
    this.wss.on('connection', this.connectionHandler.bind(this));
    this.log(`Listening on ws://localhost:${port}`);
  }

  private async connectionHandler(ws: WebSocket, req: any): Promise<void> {
    if(!req.url) {
      this.log('No URL provided, closing connection.');
      ws.close();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if(pathname !== '/') {
      this.log(`Invalid pathname: "${pathname}"`);
      ws.close();
      return;
    }

    // Instantiate new client
    this.log(`Connecting with key "${this.apiKey.slice(0, 3)}..."`);
    const client = new RealtimeClient({ apiKey: this.apiKey });
    this.sockets.set(ws, client);

    // Relay: OpenAI Realtime API Event -> Browser Event
    client.realtime.on('server.*', (event: any) => {
      this.log(`Relaying "${event.type}" to Client`);
      ws.send(JSON.stringify(event));
    });
    client.realtime.on('close', () => ws.close());

    // Relay: Browser Event -> OpenAI Realtime API Event
    const messageQueue: string[] = [];
    const messageHandler = (data: string): void => {
      try {
        const event = JSON.parse(data);
        this.log(`Relaying "${event.type}" to OpenAI`);
        client.realtime.send(event.type, event);
      } catch(e) {
        console.error((e as Error).message);
        this.log(`Error parsing event from client: ${data}`);
      }
    };

    ws.on('message', (data: string) => {
      if(!client.isConnected()) {
        messageQueue.push(data);
      } else {
        messageHandler(data);
      }
    });

    ws.on('close', () => client.disconnect());

    // Connect to OpenAI Realtime API
    try {
      this.log(`Connecting to OpenAI...`);
      await client.connect();
    } catch(e) {
      this.log(`Error connecting to OpenAI: ${(e as Error).message}`);
      ws.close();
      return;
    }

    this.log(`Connected to OpenAI successfully!`);
    while(messageQueue.length) {
      messageHandler(messageQueue.shift()!);
    }
  }

  private log(...args: unknown[]): void {
    console.log(`[RealtimeRelay]`, ...args);
  }
}
