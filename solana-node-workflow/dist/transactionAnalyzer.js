import axios from "axios";
export class TransactionAnalyzer {
    constructor(baseUrl = "https://solana-node-dashboard-v2.vercel.app") {
        this.baseUrl = baseUrl;
    }
    /**
     * Analyze a Solana transaction by its signature
     * @param signature The Solana transaction signature to analyze
     * @returns Transaction analysis result
     */
    async analyzeTransaction(signature) {
        try {
            // Step 1: Get transaction data
            const transactionData = await this.getTransactionData(signature);
            // Step 2: Select AI model
            const llmModel = "claude-3-opus-20240229";
            // Step 3: Classify transaction to determine expert model
            const expertModel = await this.classifyTransaction(transactionData, llmModel);
            // Step 4: Analyze transaction with expert model
            const analysis = await this.analyzeWithExpert(transactionData, expertModel, llmModel);
            // Step 5: Generate Mermaid diagram
            const mermaidDiagram = await this.generateMermaid(transactionData);
            return {
                signature,
                analysis,
                mermaid: mermaidDiagram,
            };
        }
        catch (error) {
            throw new Error(`Failed to analyze transaction: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get transaction data from signature
     */
    async getTransactionData(signature) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/solana-tx-history`, {
                address: signature,
                limit: 1,
            });
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            return response.data.transactions?.[0] || {};
        }
        catch (error) {
            throw new Error(`Failed to get transaction data: ${error instanceof Error ? error.message : String(error)}`);
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
                throw new Error(response.data.error);
            }
            return response.data.expertModel || "default";
        }
        catch (error) {
            throw new Error(`Failed to classify transaction: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Analyze transaction with expert model
     */
    async analyzeWithExpert(transactionData, expertModel, llmModel) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/tx-expert-analyze`, {
                transactionData,
                expertModel,
                llmModel,
            });
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            return response.data.analysis || "";
        }
        catch (error) {
            throw new Error(`Failed to analyze with expert: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generate Mermaid diagram from transaction
     */
    async generateMermaid(transactionData) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/tx-mermaid`, {
                transactionData,
            });
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            return response.data.mermaid || "";
        }
        catch (error) {
            throw new Error(`Failed to generate Mermaid diagram: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
