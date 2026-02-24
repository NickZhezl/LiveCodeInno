declare module "y-websocket" {
  import * as Y from "yjs";

  export class WebsocketProvider {
    constructor(serverUrl: string, roomname: string, doc: Y.Doc, opts?: any);
    awareness: any;
    destroy(): void;
    disconnect(): void;
    connect(): void;
  }
}