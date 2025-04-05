declare module "@modelcontextprotocol/sdk/server/index.js" {
  export class Server {
    constructor(
      info: { name: string; version: string },
      options: { capabilities: { tools: Record<string, any> } }
    );
    setRequestHandler(schema: any, handler: (request: any) => Promise<any>): void;
    connect(transport: any): Promise<void>;
  }
}

declare module "@modelcontextprotocol/sdk/server/stdio.js" {
  export class StdioServerTransport {
    constructor();
  }
}

declare module "@modelcontextprotocol/sdk/types.js" {
  export const CallToolRequestSchema: any;
  export const ListToolsRequestSchema: any;

  export interface CallToolRequest {
    params: {
      name: string;
      arguments?: Record<string, any>;
    };
  }
}
