import axios, { AxiosError } from "axios";
export class TransactionAnalyzer {
    constructor(baseUrl = "https://solana-node-dashboard-v2.vercel.app") {
        this.baseUrl = baseUrl;
    }
    /**
     * Analyze a Solana transaction by its signature
     * @param address The Solana transaction hash address to analyze
     * @returns Transaction analysis result
     */
    async analyzeTransaction(address) {
        try {
            // Step 1: Get transaction data
            const transactionData = await this.getTransactionData(address);
            // Step 2: Select AI model
            // const llmModel = "gemini-2.0-flash";
            // Step 3: Classify transaction to determine expert model
            // const expertModel = await this.classifyTransaction(transactionData, llmModel);
            // Step 4: Analyze transaction with expert model
            const analysis = await this.analyzeWithExpert(address);
            // Step 5: Generate Mermaid diagram
            const mermaidDiagram = await this.generateMermaid(transactionData);
            return {
                signature: address,
                analysis,
                mermaid: mermaidDiagram,
            };
        }
        catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(`Failed to analyze transaction: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Get transaction data from signature
     */
    async getTransactionData(address) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/solana-rpc`, {
                jsonrpc: "2.0",
                id: 1,
                method: "getTransaction",
                params: [
                    address,
                    {
                        encoding: "json",
                        maxSupportedTransactionVersion: 0,
                    },
                ],
            });
            if (response.data.error) {
                throw new Error(response.data.error.message || "Failed to get transaction data");
            }
            return response.data.result || {};
        }
        catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(`Failed to get transaction data: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Classify transaction to determine expert model
     */
    async classifyTransaction(transactionData, llmModel) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/tx-classify`, {
                transactionData,
                llmModel,
            });
            if (response.data.error) {
                throw new Error(response.data.error.message || "Failed to classify transaction");
            }
            return response.data.expertModel || "default";
        }
        catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(`Failed to classify transaction: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Analyze transaction with expert model
     */
    async analyzeWithExpert(signature) {
        try {
            // const response = await axios.post(`${this.baseUrl}/api/tx-expert-analyze`, {
            //   transactionData,
            //   expertModel,
            //   llmModel,
            // });
            const response = await axios.post(`${this.baseUrl}/api/tx-mermaid`, {
                transactionData: { signature },
            });
            if (response.data.error) {
                throw new Error(response.data.error.message || "Failed to analyze with expert");
            }
            return response.data.expertAnalysis || "";
        }
        catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(`Failed to analyze with expert: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Generate Mermaid diagram from transaction
     */
    async generateMermaid(signature) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/tx-mermaid`, {
                transactionData: { signature },
            });
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            return response.data.mermaid || "";
        }
        catch (error) {
            if (error instanceof AxiosError) {
                throw new Error(`Failed to generate Mermaid diagram: ${error.message}`);
            }
            throw error;
        }
    }
}
