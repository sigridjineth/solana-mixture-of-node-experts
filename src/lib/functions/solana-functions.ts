import { NodeFunction, FunctionInputType } from "@/types/function";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

// Solana transaction analysis function
export const analyzeSolanaTransactionFunction: NodeFunction = {
  id: "analyze-solana-transaction",
  name: "SolTx Expert",
  description: "Professionally analyzes Solana transactions and provides key information",
  category: "Tx Tools",
  groups: ["solana"],
  inputs: [
    {
      name: "transaction",
      type: "object",
      required: true,
      description: "Solana transaction data to analyze",
    },
  ],
  output: {
    name: "analysis",
    type: "string" as FunctionInputType,
    description: "Transaction analysis result",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { transaction } = inputs;

      if (!transaction) {
        throw new Error("Transaction data is a required input");
      }

      // API call - Request analysis using LLM with default prompt
      const response = await fetch("/api/tx-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionData: transaction,
          // Default prompt used (handled by API)
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      return data.analysis;
    } catch (error) {
      throw new Error(`Failed to analyze transaction: ${(error as Error).message}`);
    }
  },
};

// Solana transaction history retrieval function
export const solanaAccountHistoryFunction: NodeFunction = {
  id: "solana-account-history",
  name: "SolTx History",
  description: "Retrieves recent transaction history and detailed data for an account or program",
  category: "Solana",
  groups: ["solana"],
  inputs: [
    {
      name: "address",
      type: "string",
      required: true,
      description: "Account address or program ID to query",
    },
    {
      name: "rpcUrl",
      type: "string",
      required: false,
      description: "Solana RPC URL (uses internal API if not provided)",
    },
  ],
  output: {
    name: "result",
    type: "object" as FunctionInputType,
    description: "Transaction detail list and address",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { address, rpcUrl } = inputs;

      if (!address) {
        throw new Error("Address or program ID is required");
      }

      // API call - Get transaction data from server
      const response = await fetch("/api/solana-tx-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          rpcUrl: rpcUrl || undefined,
          limit: 10, // Fixed value
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      // Return transaction data along with address
      const returnValue = {
        transactions: data.transactions,
        address: address,
      };

      return returnValue;
    } catch (error) {
      throw new Error(`Failed to fetch Solana transaction history: ${(error as Error).message}`);
    }
  },
};

// Solana account transaction history insights analysis function
export const solanaHistoryInsightsFunction: NodeFunction = {
  id: "solana-history-insights",
  name: "SolTx Intelligence",
  description: "Analyzes transaction history to identify patterns and insights",
  category: "Tx Tools",
  groups: ["solana"],
  inputs: [
    {
      name: "result",
      type: "object",
      required: false,
      description: "Transaction data and address from SolTx History node",
    },
    {
      name: "address",
      type: "string",
      required: false,
      description: "Account address or program ID to analyze (required if result is not provided)",
    },
    {
      name: "transactions",
      type: "array",
      required: false,
      description: "Transaction data array to analyze (required if result is not provided)",
    },
  ],
  output: {
    name: "insights",
    type: "string" as FunctionInputType,
    description: "Transaction history analysis result",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { result, address, transactions } = inputs;

      let finalTransactions;
      let finalAddress;

      // Add detailed debugging logs
      console.log("SolTx Intelligence node input:", {
        result: result
          ? {
              type: typeof result,
              hasTransactions: result.transactions ? `${result.transactions.length} items` : "none",
              hasAddress: result.address ? `${result.address}` : "none",
              structure: JSON.stringify(result).substring(0, 100) + "...",
            }
          : undefined,
        address,
        transactions: transactions ? `${transactions.length} items` : undefined,
      });

      // If result is provided (connected from SolTx History node)
      if (result) {
        // More detailed validation
        if (!result.transactions) {
          console.error("Result object issue:", result);
          throw new Error(
            "Result does not contain a transaction data array. Please check the output format of the connected node."
          );
        }

        if (!Array.isArray(result.transactions)) {
          console.error("Transactions format issue:", result.transactions);
          throw new Error(
            "Transactions must be in array format. Please check the output format of the connected node."
          );
        }

        if (!result.address) {
          console.error("Address missing:", result);
          throw new Error(
            "Result does not contain an analysis target address. Please check the output format of the connected node."
          );
        }

        console.log("Valid result object confirmed. Continuing analysis");
        finalTransactions = result.transactions;
        finalAddress = result.address;
      }
      // If direct input is provided
      else if (address && transactions) {
        if (!Array.isArray(transactions)) {
          throw new Error("Transaction data must be in array format");
        }

        finalTransactions = transactions;
        finalAddress = address;
      }
      // If input data is insufficient
      else {
        throw new Error(
          "Transaction data and address are required inputs (provide either result or address and transactions)"
        );
      }

      // Log final input values before API call
      console.log("API call input values:", {
        transactions: finalTransactions ? `${finalTransactions.length} transactions` : "none",
        address: finalAddress,
      });

      // API call - Request transaction history analysis using LLM
      const response = await fetch("/api/history-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions: finalTransactions,
          address: finalAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      return data.insights;
    } catch (error) {
      throw new Error(`Failed to analyze transaction history: ${(error as Error).message}`);
    }
  },
};

// Function to convert Solana transactions to Mermaid diagrams
export const solanaTxToMermaidFunction: NodeFunction = {
  id: "solana-tx-to-mermaid",
  name: "Solana Tx to Mermaid",
  description: "Converts Solana transactions to Mermaid sequence diagrams",
  category: "Solana",
  groups: ["solana"],
  inputs: [
    {
      name: "transaction",
      type: "object",
      required: true,
      description: "Solana transaction data to convert",
    },
  ],
  output: {
    name: "mermaid",
    type: "string" as FunctionInputType,
    description: "Mermaid sequence diagram code",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { transaction } = inputs;

      if (!transaction) {
        throw new Error("Transaction data is a required input");
      }

      // API call
      const response = await fetch("/api/tx-mermaid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionData: transaction,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      return data.mermaid;
    } catch (error) {
      throw new Error(
        `Failed to convert Solana transaction to Mermaid: ${(error as Error).message}`
      );
    }
  },
};

// Solana transaction expert model classification function
export const solanaTxClassifyExpertFunction: NodeFunction = {
  id: "solana-tx-classify-expert",
  name: "SolTx Classifier",
  description: "Analyzes Solana transactions and classifies them into appropriate expert models",
  category: "Solana",
  groups: ["solana"],
  inputs: [
    {
      name: "transaction",
      type: "object",
      required: true,
      description: "Solana transaction data to analyze",
    },
    {
      name: "aiModel",
      type: "string",
      required: false,
      description: "AI model name to use",
    },
  ],
  output: {
    name: "expertModel",
    type: "string" as FunctionInputType,
    description: "Classified expert model identifier",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { transaction, llmModel } = inputs;

      if (!transaction) {
        throw new Error("Transaction data is a required input");
      }

      // LLM model to use - use default if not provided
      const selectedModel = llmModel || "gemini-2.0-flash";
      console.log(`Requesting classification with LLM model ${selectedModel}...`);

      // List of supported expert models
      const expertModels = {
        DEX_EXPERT: "dex-expert",
        NFT_EXPERT: "nft-expert",
        STAKING_EXPERT: "staking-expert",
        DEFI_EXPERT: "defi-expert",
        GENERIC_EXPERT: "generic-expert",
      };

      // API call - Request transaction analysis and expert model classification using LLM
      const response = await fetch("/api/tx-classify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionData: transaction,
          llmModel: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      console.log(`Transaction classification result: ${data.expertModel}`);

      return data.expertModel;
    } catch (error) {
      throw new Error(`Failed to classify transaction: ${(error as Error).message}`);
    }
  },
};

// Solana transaction expert analysis function
export const solanaTxExpertAnalyzeFunction: NodeFunction = {
  id: "solana-tx-expert-analyze",
  name: "SolTx Expert Analyzer",
  description: "Performs in-depth analysis of Solana transactions using specific expert models",
  category: "Solana",
  groups: ["solana"],
  inputs: [
    {
      name: "transaction",
      type: "object",
      required: true,
      description: "Solana transaction data to analyze",
    },
    {
      name: "expertModel",
      type: "string",
      required: true,
      description: "Expert model identifier to use (compatible with SolTx Classifier output)",
    },
    {
      name: "aiModel",
      type: "string",
      required: false,
      description: "AI model name to use",
      default: "gemini-2.0-flash",
    },
  ],
  output: {
    name: "expertAnalysis",
    type: "string" as FunctionInputType,
    description: "Transaction analysis result from the selected expert model",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { transaction, expertModel, llmModel } = inputs;

      if (!transaction) {
        throw new Error("Transaction data is a required input");
      }

      if (!expertModel) {
        throw new Error("Expert model identifier is a required input");
      }

      // LLM model to use - use default if not provided
      const selectedModel = llmModel || "gemini-2.0-flash";
      console.log(`Requesting analysis with LLM model ${selectedModel}...`);

      // List of supported expert models (same as solanaTxClassifyExpertFunction)
      const supportedModels = [
        "dex-expert",
        "nft-expert",
        "staking-expert",
        "defi-expert",
        "generic-expert",
      ];

      // Check if model is valid
      if (!supportedModels.includes(expertModel)) {
        throw new Error(
          `Unsupported expert model: ${expertModel}. Supported models: ${supportedModels.join(
            ", "
          )}`
        );
      }

      console.log(`Analyzing transaction using expert model ${expertModel}...`);

      // API call - Request transaction analysis using selected expert model
      const response = await fetch("/api/tx-expert-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionData: transaction,
          expertModel: expertModel,
          llmModel: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      return data.expertAnalysis || "No analysis results available.";
    } catch (error) {
      throw new Error(`Failed to perform expert analysis: ${(error as Error).message}`);
    }
  },
};

// LLM model selection node
export const modelProviderSelectorFunction: NodeFunction = {
  id: "model-provider-selector",
  name: "AI Model Selector",
  description: "Selects AI model provider and model to return the model name to use",
  category: "Solana",
  groups: ["solana", "utils"],
  inputs: [
    {
      name: "provider",
      type: "string",
      required: true,
      description: "LLM model provider (huggingface or openrouter)",
      default: "huggingface",
    },
    {
      name: "model",
      type: "string",
      required: true,
      description: "Model name to use from the selected provider",
    },
    {
      name: "apiKey",
      type: "string",
      required: true,
      description: "API key for the provider (stored securely)",
    },
  ],
  output: {
    name: "model",
    type: "string" as FunctionInputType,
    description: "Selected model name",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { provider, model, apiKey } = inputs;

      if (!provider) {
        throw new Error("Model provider is a required input");
      }

      if (!model) {
        throw new Error("Model name is a required input");
      }

      if (!apiKey) {
        throw new Error("API key is a required input");
      }

      // List of supported models
      const supportedModels = {
        huggingface: ["mome-1.0", "mome-1.0-pro-exp"],
        openrouter: [
          "openai/gpt-4o",
          "openai/gpt-4-turbo",
          "openai/gpt-3.5-turbo",
          "anthropic/claude-3-opus",
          "anthropic/claude-3-sonnet",
          "google/gemini-2.0-flash",
          "google/gemini-1.5-pro",
        ],
      };

      // Check if provider is supported
      if (!supportedModels[provider.toLowerCase()]) {
        throw new Error(
          `Unsupported provider: ${provider}. Supported providers: huggingface, openrouter`
        );
      }

      // Check if model is supported by the selected provider
      const providerModels = supportedModels[provider.toLowerCase()];
      if (!providerModels.includes(model)) {
        throw new Error(
          `Model ${model} is not supported by ${provider} provider. Supported models: ${providerModels.join(
            ", "
          )}`
        );
      }

      console.log(`Selected provider: ${provider}, model: ${model}`);

      // Return only the model name
      return model;
    } catch (error) {
      throw new Error(`Failed to select model: ${(error as Error).message}`);
    }
  },
};

// Solana wallet connection node
export const solanaWalletConnectFunction: NodeFunction = {
  id: "solana-wallet-connect",
  name: "Connect Wallet",
  description: "Connect to a Solana wallet",
  category: "Solana",
  groups: ["solana"],
  inputs: [],
  output: {
    name: "walletInfo",
    type: "object",
    description: "Wallet connection information",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { connection, walletProvider } = inputs;

      if (!walletProvider?.publicKey) {
        return {
          connected: false,
          network: null,
          address: null,
          balance: null,
          message: "Wallet not connected",
        };
      }

      // Get SOL balance
      const balanceInLamports = await connection.getBalance(walletProvider.publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

      // Get network
      const networkType = connection.rpcEndpoint.includes("devnet")
        ? "devnet"
        : connection.rpcEndpoint.includes("testnet")
        ? "testnet"
        : "mainnet-beta";

      return {
        connected: true,
        network: networkType,
        address: walletProvider.publicKey.toString(),
        balance: balanceInSOL,
        message: "Wallet connected successfully",
      };
    } catch (error: any) {
      console.error("Error in solanaWalletConnectFunction:", error);
      return {
        connected: false,
        network: null,
        address: null,
        balance: null,
        message: `Error connecting wallet: ${error.message}`,
      };
    }
  },
};

// Solana transaction send node
export const solanaSendTransactionFunction: NodeFunction = {
  id: "solana-send-transaction",
  name: "Send Transaction",
  description: "Send a Solana transaction",
  category: "Tx Tools",
  groups: ["solana"],
  inputs: [
    {
      name: "sender",
      type: "object",
      required: true,
      description: "Connect a wallet node to get sender address",
    },
    {
      name: "recipient",
      type: "string",
      required: true,
      description: "Recipient address",
    },
    {
      name: "amount",
      type: "number",
      required: true,
      description: "Amount of SOL to send",
    },
  ],
  output: {
    name: "transactionInfo",
    type: "object",
    description: "Transaction information",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { recipient, amount, walletInfo, sender } = inputs;

      if (!recipient) {
        throw new Error("Recipient address is required");
      }

      if (!amount || amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      // Use sender address from direct input or from walletInfo
      let senderAddress = null;

      // Check if walletInfo is provided (from Connect Wallet node)
      if (walletInfo && walletInfo.address) {
        senderAddress = walletInfo.address;
      }
      // Check if sender is provided directly
      else if (sender) {
        senderAddress = sender;
      }

      if (!senderAddress) {
        throw new Error(
          "Sender address is required. Please connect a wallet or provide a sender address"
        );
      }

      // Get the wallet provider from the window object
      const walletProvider = (window as any).solana;
      if (!walletProvider) {
        throw new Error("Wallet not connected. Please connect your wallet first.");
      }

      // Create connection to Solana network
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
      );

      // Create the transaction
      const solanaTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(senderAddress),
          toPubkey: new PublicKey(recipient),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      solanaTransaction.recentBlockhash = blockhash;
      solanaTransaction.feePayer = new PublicKey(senderAddress);

      // Sign the transaction with the wallet
      const signedTransaction = await walletProvider.signTransaction(solanaTransaction);

      // Send the transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      // Get transaction details
      const txDetails = await connection.getTransaction(signature);

      // Create a transaction object that can be used by other nodes
      const transactionInfo = {
        signature,
        blockTime: Math.floor(Date.now() / 1000),
        slot: txDetails?.slot || 0,
        type: "SOL Transfer",
        err: null,
        transaction: {
          message: {
            accountKeys: [senderAddress, recipient],
            instructions: [
              {
                programId: "11111111111111111111111111111111", // System program ID
                accounts: [senderAddress, recipient],
                data: `Transfer ${amount} SOL`,
              },
            ],
          },
          signatures: [signature],
        },
        meta: {
          fee: txDetails?.meta?.fee || 5000,
          postBalances: txDetails?.meta?.postBalances || [0, 0],
          preBalances: txDetails?.meta?.preBalances || [0, 0],
        },
      };

      return {
        success: true,
        signature,
        message: "Transaction sent and confirmed successfully",
        transaction: transactionInfo,
      };
    } catch (error: any) {
      console.error("Error in solanaSendTransactionFunction:", error);
      return {
        success: false,
        signature: null,
        message: `Error sending transaction: ${error.message}`,
        transaction: null,
      };
    }
  },
};

// New nodes with webp icons that show a "To be Continued" modal
export const solanaOrcaFunction: NodeFunction = {
  id: "solana-orca",
  name: "Orca",
  description: "Orca DEX integration for Solana",
  category: "Expert Models",
  groups: ["solana"],
  icon: "/solana-orca.webp",
  inputs: [],
  output: {
    name: "result",
    type: "object",
    description: "Orca DEX operation result",
  },
  execute: async (inputs: Record<string, any>) => {
    // This function will show a "To be Continued" modal when clicked
    return {
      message: "To be Continued",
      description: "This feature will be supported in a future update.",
    };
  },
};

export const solanaJupyterFunction: NodeFunction = {
  id: "solana-jupyter",
  name: "Jupyter",
  description: "Jupyter integration for Solana data analysis",
  category: "Expert Models",
  groups: ["solana"],
  icon: "/solana-jupyter.webp",
  inputs: [],
  output: {
    name: "result",
    type: "object",
    description: "Jupyter analysis result",
  },
  execute: async (inputs: Record<string, any>) => {
    // This function will show a "To be Continued" modal when clicked
    return {
      message: "To be Continued",
      description: "This feature will be supported in a future update.",
    };
  },
};

export const solanaRaydiumFunction: NodeFunction = {
  id: "solana-raydium",
  name: "Raydium",
  description: "Raydium DEX integration for Solana",
  category: "Expert Models",
  groups: ["solana"],
  icon: "/solana-raydium.webp",
  inputs: [],
  output: {
    name: "result",
    type: "object",
    description: "Raydium DEX operation result",
  },
  execute: async (inputs: Record<string, any>) => {
    // This function will show a "To be Continued" modal when clicked
    return {
      message: "To be Continued",
      description: "This feature will be supported in a future update.",
    };
  },
};

export const solanaHuggingFaceFunction: NodeFunction = {
  id: "solana-huggingface",
  name: "HuggingFace",
  description: "HuggingFace integration for Solana",
  category: "Expert Models",
  groups: ["solana"],
  icon: "/huggingface-color.svg",
  inputs: [],
  output: {
    name: "result",
    type: "object",
    description: "HuggingFace operation result",
  },
  execute: async (inputs: Record<string, any>) => {
    // This function will show a "To be Continued" modal when clicked
    return {
      message: "To be Continued",
      description: "This feature will be supported in a future update.",
    };
  },
};
