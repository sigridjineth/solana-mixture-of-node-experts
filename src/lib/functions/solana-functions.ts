import { NodeFunction, FunctionInputType } from "@/types/function";

// Solana 트랜잭션 분석 함수
export const analyzeSolanaTransactionFunction: NodeFunction = {
  id: "analyze-solana-transaction",
  name: "Analyze Solana Tx",
  description: "Solana 트랜잭션의 기본 정보를 분석합니다",
  category: "Solana",
  groups: ["solana"],
  inputs: [
    {
      name: "transaction",
      type: "object",
      required: true,
      description: "분석할 Solana 트랜잭션 데이터",
    },
  ],
  output: {
    name: "analysis",
    type: "object" as FunctionInputType,
    description: "트랜잭션 분석 결과",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { transaction } = inputs;

      if (!transaction) {
        throw new Error("트랜잭션 데이터는 필수 입력값입니다");
      }

      // API 호출
      const response = await fetch("/api/tx-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionData: transaction,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `API 요청 실패: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API 에러: ${data.error}`);
      }

      return data.analysis;
    } catch (error) {
      throw new Error(`트랜잭션 분석 실패: ${(error as Error).message}`);
    }
  },
};

// Solana 트랜잭션을 Mermaid 다이어그램으로 변환하는 함수
export const solanaTxToMermaidFunction: NodeFunction = {
  id: "solana-tx-to-mermaid",
  name: "Solana Tx to Mermaid",
  description: "Solana 트랜잭션을 Mermaid 시퀀스 다이어그램으로 변환합니다",
  category: "Solana",
  groups: ["solana"],
  inputs: [
    {
      name: "transaction",
      type: "object",
      required: true,
      description: "변환할 Solana 트랜잭션 데이터",
    },
  ],
  output: {
    name: "mermaid",
    type: "string" as FunctionInputType,
    description: "Mermaid 시퀀스 다이어그램 코드",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { transaction } = inputs;

      if (!transaction) {
        throw new Error("트랜잭션 데이터는 필수 입력값입니다");
      }

      // API 호출
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
        throw new Error(
          `API 요청 실패: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API 에러: ${data.error}`);
      }

      return data.mermaid;
    } catch (error) {
      throw new Error(
        `Solana 트랜잭션 Mermaid 변환 실패: ${(error as Error).message}`
      );
    }
  },
};
