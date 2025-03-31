import { NodeFunction } from "@/types/function";

// Solana 트랜잭션 분석 함수
export const analyzeSolanaTransactionFunction: NodeFunction = {
  id: "analyze-solana-transaction",
  name: "Analyze Solana Transaction",
  description: "Gemini AI를 이용해 Solana 트랜잭션을 분석하고 요약합니다",
  category: "Solana",
  groups: ["solana_group"],
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
    type: "string",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { transaction } = inputs;

      if (!transaction) {
        throw new Error("트랜잭션 데이터는 필수 입력값입니다");
      }

      // 내부 Gemini API 호출
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionData: transaction }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(`트랜잭션 분석 오류: ${result.error}`);
      }

      // 분석 결과를 단순 텍스트로 변환하여 반환
      return result.analysis;
    } catch (error) {
      throw new Error(`트랜잭션 분석 실패: ${(error as Error).message}`);
    }
  },
};
