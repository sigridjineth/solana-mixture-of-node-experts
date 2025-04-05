#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { TransactionAnalyzer } from "./transactionAnalyzer.js";
import { config } from "dotenv";

// Load environment variables
config();

// Create MCP server
const server = new Server(
  {
    name: "solana-node-workflow",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_solana_transaction",
        description: "Analyze a Solana transaction by its signature",
        inputSchema: {
          type: "object",
          properties: {
            signature: {
              type: "string",
              description: "Solana transaction signature to analyze",
            },
            endpoint: {
              type: "string",
              description: "Custom API endpoint (optional)",
              default: "https://solana-node-dashboard-v2.vercel.app",
            },
          },
          required: ["signature"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "analyze_solana_transaction") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  try {
    const { signature, endpoint } = request.params.arguments as {
      signature: string;
      endpoint?: string;
    };

    // Initialize transaction analyzer
    const analyzer = new TransactionAnalyzer(
      endpoint || "https://solana-node-dashboard-v2.vercel.app"
    );

    // Analyze transaction
    const result = await analyzer.analyzeTransaction(signature);

    // Format output according to MCP protocol
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              type: "solana-transaction-analysis",
              data: {
                signature: result.signature,
                analysis: result.analysis,
                mermaid: result.mermaid,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              type: "error",
              data: {
                message: error instanceof Error ? error.message : String(error),
              },
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Run the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch(console.error);
