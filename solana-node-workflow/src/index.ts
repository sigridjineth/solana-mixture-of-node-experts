#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { TransactionAnalyzer } from "./transactionAnalyzer.js";
import { config } from "dotenv";

// Load environment variables
config();

// Parse command line arguments
const args = process.argv.slice(2);
const endpoint =
  args.find((arg) => arg.startsWith("--endpoint="))?.split("=")[1] ||
  "https://solana-node-dashboard-v2.vercel.app";

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

// Initialize transaction analyzer
const analyzer = new TransactionAnalyzer(endpoint);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_transaction_data",
        description: "Get transaction data from address",
        inputSchema: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Solana transaction hash address",
            },
            endpoint: {
              type: "string",
              description: "Custom API endpoint (optional)",
              default: endpoint,
            },
          },
          required: ["address"],
        },
      },
      {
        name: "classify_transaction",
        description: "Classify transaction to determine expert model",
        inputSchema: {
          type: "object",
          properties: {
            transactionData: {
              type: "object",
              description: "Transaction data",
            },
            llmModel: {
              type: "string",
              description: "LLM model to use",
              default: "claude-3-opus-20240229",
            },
            endpoint: {
              type: "string",
              description: "Custom API endpoint (optional)",
              default: endpoint,
            },
          },
          required: ["transactionData"],
        },
      },
      {
        name: "analyze_with_expert",
        description: "Analyze transaction with expert model",
        inputSchema: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Solana transaction hash address",
            },
            endpoint: {
              type: "string",
              description: "Custom API endpoint (optional)",
              default: endpoint,
            },
          },
          required: ["address"],
        },
      },
      {
        name: "generate_mermaid",
        description: "Generate Mermaid diagram from transaction",
        inputSchema: {
          type: "object",
          properties: {
            transactionData: {
              type: "object",
              description: "Transaction data",
            },
            endpoint: {
              type: "string",
              description: "Custom API endpoint (optional)",
              default: endpoint,
            },
          },
          required: ["transactionData"],
        },
      },
      {
        name: "analyze_solana_transaction",
        description: "Analyze a Solana transaction by its signature",
        inputSchema: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Solana transaction hash address to analyze",
            },
            endpoint: {
              type: "string",
              description: "Custom API endpoint (optional)",
              default: endpoint,
            },
          },
          required: ["address"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { name, arguments: args } = request.params;
  const customEndpoint = (args?.endpoint as string) || endpoint;

  try {
    switch (name) {
      case "get_transaction_data": {
        const address = args?.address as string;
        if (!address) {
          throw new Error("Address is required");
        }

        const result = await analyzer.getTransactionData(address);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "classify_transaction": {
        const transactionData = args?.transactionData as Record<string, any>;
        const llmModel = (args?.llmModel as string) || "claude-3-opus-20240229";

        if (!transactionData) {
          throw new Error("Transaction data is required");
        }

        const result = await analyzer.classifyTransaction(transactionData, llmModel);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "analyze_with_expert": {
        const transactionData = args?.transactionData as Record<string, any>;
        const expertModel = args?.expertModel as string;
        const llmModel = (args?.llmModel as string) || "claude-3-opus-20240229";

        if (!transactionData) {
          throw new Error("Transaction data is required");
        }

        if (!expertModel) {
          throw new Error("Expert model is required");
        }

        const result = await analyzer.analyzeWithExpert(transactionData.address);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "generate_mermaid": {
        const transactionData = args?.transactionData as Record<string, any>;

        if (!transactionData) {
          throw new Error("Transaction data is required");
        }

        const result = await analyzer.generateMermaid(transactionData.signature);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "analyze_solana_transaction": {
        const address = args?.address as string;
        if (!address) {
          throw new Error("address is required");
        }

        const result = await analyzer.analyzeTransaction(address);

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
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
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
