import { NodeFunction, FunctionInputType } from "@/types/function";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

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
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
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
  description: "계정 또는 프로그램의 최근 트랜잭션 내역과 상세 데이터를 가져옵니다",
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
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
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
      throw new Error(`트랜잭션 히스토리 조회 실패: ${(error as Error).message}`);
    }
  },
};

// Solana 계정 트랜잭션 히스토리 인사이트 분석 함수
export const solanaHistoryInsightsFunction: NodeFunction = {
  id: "solana-history-insights",
  name: "SolTx Intelligence",
  description: "계정 또는 프로그램의 트랜잭션 히스토리를 분석하여 패턴과 인사이트를 도출합니다",
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
      description: "분석할 계정 주소 또는 프로그램 ID (result가 없을 경우 필수)",
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

      // 자세한 디버깅 로그 추가
      console.log("SolTx Intelligence 노드 입력:", {
        result: result
          ? {
              type: typeof result,
              hasTransactions: result.transactions ? `${result.transactions.length}개` : "없음",
              hasAddress: result.address ? `${result.address}` : "없음",
              structure: JSON.stringify(result).substring(0, 100) + "...",
            }
          : undefined,
        address,
        transactions: transactions ? `${transactions.length}개` : undefined,
      });

      // result가 제공된 경우 (SolTx History 노드에서 연결된 경우)
      if (result) {
        // 더 자세한 유효성 검증
        if (!result.transactions) {
          console.error("result 객체 문제:", result);
          throw new Error(
            "result에 트랜잭션 데이터 배열이 없습니다. 연결된 노드의 출력 형식을 확인하세요."
          );
        }

        if (!Array.isArray(result.transactions)) {
          console.error("transactions 형식 문제:", result.transactions);
          throw new Error(
            "transactions는 배열 형식이어야 합니다. 연결된 노드의 출력 형식을 확인하세요."
          );
        }

        if (!result.address) {
          console.error("address 누락:", result);
          throw new Error(
            "result에 분석 대상 주소가 없습니다. 연결된 노드의 출력 형식을 확인하세요."
          );
        }

        console.log("유효한 result 객체 확인. 분석 계속 진행");
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

      // API 호출 전 최종 입력값 로깅
      console.log("API 호출 입력값:", {
        transactions: finalTransactions ? `${finalTransactions.length}개 트랜잭션` : "없음",
        address: finalAddress,
      });

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
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API 에러: ${data.error}`);
      }

      return data.insights;
    } catch (error) {
      throw new Error(`트랜잭션 히스토리 분석 실패: ${(error as Error).message}`);
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
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API 에러: ${data.error}`);
      }

      return data.mermaid;
    } catch (error) {
      throw new Error(`Solana 트랜잭션 Mermaid 변환 실패: ${(error as Error).message}`);
    }
  },
};

// Solana 트랜잭션 전문가 모델 분류 함수
export const solanaTxClassifyExpertFunction: NodeFunction = {
  id: "solana-tx-classify-expert",
  name: "SolTx Classifier",
  description: "Solana 트랜잭션을 분석하여 적합한 전문가 모델로 분류합니다",
  category: "Solana",
  groups: ["solana"],
  inputs: [
    {
      name: "transaction",
      type: "object",
      required: true,
      description: "분석할 Solana 트랜잭션 데이터",
    },
    {
      name: "aiModel",
      type: "string",
      required: false,
      description: "사용할 AI 모델 이름",
    },
  ],
  output: {
    name: "expertModel",
    type: "string" as FunctionInputType,
    description: "분류된 전문가 모델 식별자",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { transaction, llmModel } = inputs;

      if (!transaction) {
        throw new Error("트랜잭션 데이터는 필수 입력값입니다");
      }

      // 사용할 LLM 모델 - 입력이 없으면 기본값 사용
      const selectedModel = llmModel || "gemini-2.0-flash";
      console.log(`LLM 모델 ${selectedModel}로 분류 요청 중...`);

      // 지원되는 전문가 모델 목록
      const expertModels = {
        DEX_EXPERT: "dex-expert",
        NFT_EXPERT: "nft-expert",
        STAKING_EXPERT: "staking-expert",
        DEFI_EXPERT: "defi-expert",
        GENERIC_EXPERT: "generic-expert",
      };

      // API 호출 - LLM으로 트랜잭션 분석 및 전문가 모델 분류 요청
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
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API 에러: ${data.error}`);
      }

      console.log(`트랜잭션 분류 결과: ${data.expertModel}`);

      return data.expertModel;
    } catch (error) {
      throw new Error(`트랜잭션 분류 실패: ${(error as Error).message}`);
    }
  },
};

// Solana 트랜잭션 전문가 분석 함수
export const solanaTxExpertAnalyzeFunction: NodeFunction = {
  id: "solana-tx-expert-analyze",
  name: "SolTx Expert Analyzer",
  description: "특정 전문가 모델을 사용하여 Solana 트랜잭션을 심층 분석합니다",
  category: "Solana",
  groups: ["solana"],
  inputs: [
    {
      name: "transaction",
      type: "object",
      required: true,
      description: "분석할 Solana 트랜잭션 데이터",
    },
    {
      name: "expertModel",
      type: "string",
      required: true,
      description: "사용할 전문가 모델 식별자 (SolTx Classifier의 출력과 호환)",
    },
    {
      name: "aiModel",
      type: "string",
      required: false,
      description: "사용할 AI 모델 이름",
      default: "gemini-2.0-flash",
    },
  ],
  output: {
    name: "expertAnalysis",
    type: "string" as FunctionInputType,
    description: "선택된 전문가 모델에 의한 트랜잭션 분석 결과",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { transaction, expertModel, llmModel } = inputs;

      if (!transaction) {
        throw new Error("트랜잭션 데이터는 필수 입력값입니다");
      }

      if (!expertModel) {
        throw new Error("전문가 모델 식별자는 필수 입력값입니다");
      }

      // 사용할 LLM 모델 - 입력이 없으면 기본값 사용
      const selectedModel = llmModel || "gemini-2.0-flash";
      console.log(`LLM 모델 ${selectedModel}로 분석 요청 중...`);

      // 지원되는 전문가 모델 목록 (solanaTxClassifyExpertFunction과 동일)
      const supportedModels = [
        "dex-expert",
        "nft-expert",
        "staking-expert",
        "defi-expert",
        "generic-expert",
      ];

      // 유효한 모델인지 확인
      if (!supportedModels.includes(expertModel)) {
        throw new Error(
          `지원되지 않는 전문가 모델: ${expertModel}. 지원되는 모델: ${supportedModels.join(", ")}`
        );
      }

      console.log(`전문가 모델 ${expertModel}을(를) 사용하여 트랜잭션 분석 중...`);

      // API 호출 - 선택된 전문가 모델을 사용하여 트랜잭션 분석 요청
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
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API 에러: ${data.error}`);
      }

      return data.expertAnalysis || "분석 결과가 없습니다.";
    } catch (error) {
      throw new Error(`전문가 분석 실패: ${(error as Error).message}`);
    }
  },
};

// LLM 모델 선택 노드
export const modelProviderSelectorFunction: NodeFunction = {
  id: "model-provider-selector",
  name: "AI Model Selector",
  description: "AI 모델 프로바이더와 모델을 선택하여 사용할 모델 이름을 반환합니다",
  category: "Solana",
  groups: ["solana", "utils"],
  inputs: [
    {
      name: "provider",
      type: "string",
      required: true,
      description: "LLM 모델 프로바이더 (huggingface 또는 openrouter)",
      default: "huggingface",
    },
    {
      name: "model",
      type: "string",
      required: true,
      description: "선택한 프로바이더에서 사용할 모델 이름",
    },
    {
      name: "apiKey",
      type: "string",
      required: true,
      description: "프로바이더에서 사용할 API 키 (안전하게 저장됩니다)",
    },
  ],
  output: {
    name: "model",
    type: "string" as FunctionInputType,
    description: "선택된 모델 이름",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { provider, model, apiKey } = inputs;

      if (!provider) {
        throw new Error("모델 프로바이더는 필수 입력값입니다");
      }

      if (!model) {
        throw new Error("모델 이름은 필수 입력값입니다");
      }

      if (!apiKey) {
        throw new Error("API 키는 필수 입력값입니다");
      }

      // 지원되는 모델 목록
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

      // 지원되는 프로바이더인지 확인
      if (!supportedModels[provider.toLowerCase()]) {
        throw new Error(
          `지원되지 않는 프로바이더: ${provider}. 지원되는 프로바이더: huggingface, openrouter`
        );
      }

      // 선택한 프로바이더에서 지원하는 모델인지 확인
      const providerModels = supportedModels[provider.toLowerCase()];
      if (!providerModels.includes(model)) {
        throw new Error(
          `${provider} 프로바이더에서 지원하지 않는 모델: ${model}. 지원되는 모델: ${providerModels.join(
            ", "
          )}`
        );
      }

      console.log(`선택된 프로바이더: ${provider}, 모델: ${model}`);

      // 모델 이름만 반환
      return model;
    } catch (error) {
      throw new Error(`모델 선택 실패: ${(error as Error).message}`);
    }
  },
};

// Solana 지갑 연결 노드
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

// Solana 트랜잭션 전송 노드
export const solanaSendTransactionFunction: NodeFunction = {
  id: "solana-send-transaction",
  name: "Send Transaction",
  description: "Send a Solana transaction",
  category: "Solana",
  groups: ["solana"],
  inputs: [
    {
      name: "sender",
      type: "string",
      required: false,
      // description: "Sender Wallet Information",
      description: "Connect a wallet to get sender address",
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
    {
      name: "walletInfo",
      type: "object",
      required: false,
      description: "Wallet information from Connect Wallet node's walletInfo output",
    },
  ],
  output: {
    name: "transactionInfo",
    type: "object",
    description: "Transaction information",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { recipient, amount, walletInfo } = inputs;

      if (!recipient) {
        throw new Error("Recipient address is required");
      }

      if (!amount || amount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      // Use sender address from direct input or from walletInfo
      const senderAddress = walletInfo?.address;

      if (!senderAddress) {
        throw new Error("Sender address is required. Please connect a wallet");
      }

      const response = await fetch("/api/solana-send-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient,
          amount,
          senderAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send transaction: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`API error: ${data.error}`);
      }

      return {
        success: true,
        signature: data.signature,
        message: "Transaction sent successfully",
      };
    } catch (error: any) {
      console.error("Error in solanaSendTransactionFunction:", error);
      return {
        success: false,
        signature: null,
        message: `Error sending transaction: ${error.message}`,
      };
    }
  },
};
