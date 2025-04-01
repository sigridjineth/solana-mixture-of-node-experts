import { NodeFunction, FunctionInputType } from "@/types/function";

// Solana 트랜잭션 분석 함수
export const analyzeSolanaTransactionFunction: NodeFunction = {
  id: "analyze-solana-transaction",
  name: "SolTx Expert",
  description: "Solana 트랜잭션을 전문적으로 분석하고 핵심 정보를 제공합니다",
  category: "Tx Tools",
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
    type: "string" as FunctionInputType,
    description: "트랜잭션 분석 결과",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { transaction } = inputs;

      if (!transaction) {
        throw new Error("트랜잭션 데이터는 필수 입력값입니다");
      }

      // API 호출 - 기본 프롬프트를 사용하여 LLM으로 분석 요청
      const response = await fetch("/api/tx-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionData: transaction,
          // 기본 프롬프트 사용 (API에서 처리)
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

// Solana 트랜잭션 히스토리 조회 함수
export const solanaAccountHistoryFunction: NodeFunction = {
  id: "solana-account-history",
  name: "SolTx History",
  description:
    "계정 또는 프로그램의 최근 트랜잭션 내역과 상세 데이터를 가져옵니다",
  category: "Solana",
  groups: ["solana"],
  inputs: [
    {
      name: "address",
      type: "string",
      required: true,
      description: "조회할 계정 주소 또는 프로그램 ID",
    },
    {
      name: "rpcUrl",
      type: "string",
      required: false,
      description: "Solana RPC URL (입력하지 않으면 내부 API 사용)",
    },
  ],
  output: {
    name: "result",
    type: "object" as FunctionInputType,
    description: "트랜잭션 상세 데이터 목록 및 주소",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { address, rpcUrl } = inputs;

      if (!address) {
        throw new Error("계정 주소 또는 프로그램 ID는 필수 입력값입니다");
      }

      // API 호출 - 서버 측에서 트랜잭션 데이터 가져오기
      const response = await fetch("/api/solana-tx-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          rpcUrl: rpcUrl || undefined,
          limit: 10, // 고정된 값
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

      // 트랜잭션 데이터와 주소를 함께 반환
      const returnValue = {
        transactions: data.transactions,
        address: address,
      };

      return returnValue;
    } catch (error) {
      throw new Error(
        `트랜잭션 히스토리 조회 실패: ${(error as Error).message}`
      );
    }
  },
};

// Solana 계정 트랜잭션 히스토리 인사이트 분석 함수
export const solanaHistoryInsightsFunction: NodeFunction = {
  id: "solana-history-insights",
  name: "SolTx Intelligence",
  description:
    "계정 또는 프로그램의 트랜잭션 히스토리를 분석하여 패턴과 인사이트를 도출합니다",
  category: "Tx Tools",
  groups: ["solana"],
  inputs: [
    {
      name: "result",
      type: "object",
      required: false,
      description: "SolTx History 노드로부터 가져온 트랜잭션 데이터 및 주소",
    },
    {
      name: "address",
      type: "string",
      required: false,
      description:
        "분석할 계정 주소 또는 프로그램 ID (result가 없을 경우 필수)",
    },
    {
      name: "transactions",
      type: "array",
      required: false,
      description: "분석할 트랜잭션 데이터 배열 (result가 없을 경우 필수)",
    },
  ],
  output: {
    name: "insights",
    type: "string" as FunctionInputType,
    description: "트랜잭션 히스토리 분석 결과",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { result, address, transactions } = inputs;

      let finalTransactions;
      let finalAddress;

      // result가 제공된 경우 (SolTx History 노드에서 연결된 경우)
      if (result) {
        if (!result.transactions || !Array.isArray(result.transactions)) {
          throw new Error("result에 트랜잭션 데이터 배열이 없습니다");
        }

        if (!result.address) {
          throw new Error("result에 분석 대상 주소가 없습니다");
        }

        finalTransactions = result.transactions;
        finalAddress = result.address;
      }
      // 직접 입력이 제공된 경우
      else if (address && transactions) {
        if (!Array.isArray(transactions)) {
          throw new Error("트랜잭션 데이터는 배열 형식이어야 합니다");
        }

        finalTransactions = transactions;
        finalAddress = address;
      }
      // 입력 데이터가 충분하지 않은 경우
      else {
        throw new Error(
          "트랜잭션 데이터와 주소는 필수 입력값입니다 (result 또는 address와 transactions를 제공해야 합니다)"
        );
      }

      // API 호출 - LLM으로 트랜잭션 히스토리 분석 요청
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
        throw new Error(
          `API 요청 실패: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API 에러: ${data.error}`);
      }

      return data.insights;
    } catch (error) {
      throw new Error(
        `트랜잭션 히스토리 분석 실패: ${(error as Error).message}`
      );
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
