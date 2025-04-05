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
            // 직접 트랜잭션 분석 API를 호출
            const analysisResponse = await axios.post(`${this.baseUrl}/api/tx-analyze`, {
                transactionData: { signature },
            });
            if (analysisResponse.data.error) {
                throw new Error(analysisResponse.data.error);
            }
            // Mermaid 다이어그램 생성
            const mermaidResponse = await axios.post(`${this.baseUrl}/api/tx-mermaid`, {
                transactionData: { signature },
            });
            if (mermaidResponse.data.error) {
                throw new Error(mermaidResponse.data.error);
            }
            return {
                signature,
                analysis: analysisResponse.data.analysis || "",
                mermaid: mermaidResponse.data.mermaid || "",
            };
        }
        catch (error) {
            throw new Error(`Failed to analyze transaction: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
