import { NodeFunction } from "@/types/function";

// Solana 트랜잭션 데이터 가져오기 노드
export const solanaTxFetchFunction: NodeFunction = {
  id: "solana-tx-fetch",
  name: "Get SolTx",
  description: "트랜잭션 해시(서명)로 Solana 트랜잭션 데이터를 가져옵니다",
  category: "Solana",
  groups: ["solana"],
  inputs: [
    {
      name: "txHash",
      type: "string",
      required: true,
      description: "트랜잭션 해시 (서명)",
    },
    {
      name: "rpcUrl",
      type: "string",
      required: false,
      description: "Solana RPC URL (입력하지 않으면 내부 API 사용)",
    },
  ],
  output: {
    name: "transaction",
    type: "object",
    description: "가져온 Solana 트랜잭션 데이터",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { txHash, rpcUrl } = inputs;

      if (!txHash) {
        throw new Error("트랜잭션 해시는 필수 입력값입니다");
      }

      // RPC 요청 데이터 준비
      const requestData = {
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: [
          txHash,
          {
            encoding: "json",
            maxSupportedTransactionVersion: 0,
          },
        ],
      };

      let response;

      // 커스텀 RPC URL이 제공된 경우 직접 호출, 아니면 내부 API 사용
      if (rpcUrl) {
        response = await fetch(rpcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
      } else {
        // 내부 API를 통해 요청 (CORS 및 403 오류 방지)
        response = await fetch("/api/solana-rpc", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
      }

      if (!response.ok) {
        throw new Error(
          `RPC 요청 실패: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(
          `RPC 에러: ${data.error.message || JSON.stringify(data.error)}`
        );
      }

      return data.result;
    } catch (error) {
      throw new Error(
        `Solana 트랜잭션 가져오기 실패: ${(error as Error).message}`
      );
    }
  },
};

// 텍스트 변환 함수
export const fetchDataFunction: NodeFunction = {
  id: "fetch-data",
  name: "Fetch Data",
  description: "Fetches data from an API endpoint",
  category: "Data",
  groups: ["default"],
  inputs: [
    {
      name: "url",
      type: "string",
      required: true,
    },
    {
      name: "method",
      type: "string",
      required: false,
      default: "GET",
    },
  ],
  output: {
    name: "response",
    type: "object",
    description: "API 응답 데이터",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { url, method = "GET" } = inputs;
      const response = await fetch(url, { method });
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch data: ${(error as Error).message}`);
    }
  },
};

export const filterDataFunction: NodeFunction = {
  id: "filter-data",
  name: "Filter Data",
  description: "Filters an array based on a key and value",
  category: "Data",
  groups: ["default"],
  inputs: [
    {
      name: "data",
      type: "array",
      required: true,
    },
    {
      name: "key",
      type: "string",
      required: true,
    },
    {
      name: "value",
      type: "string",
      required: true,
    },
  ],
  output: {
    name: "filtered",
    type: "array",
    description: "필터링된 데이터 배열",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { data, key, value } = inputs;
      if (!Array.isArray(data)) {
        throw new Error("Input data must be an array");
      }

      const filtered = data.filter(
        (item) => item[key] && item[key].toString().includes(value)
      );

      return filtered;
    } catch (error) {
      throw new Error(`Failed to filter data: ${(error as Error).message}`);
    }
  },
};

export const sortDataFunction: NodeFunction = {
  id: "sort-data",
  name: "Sort Data",
  description: "Sorts an array based on a key",
  category: "Data",
  groups: ["default"],
  inputs: [
    {
      name: "data",
      type: "array",
      required: true,
    },
    {
      name: "key",
      type: "string",
      required: true,
    },
    {
      name: "ascending",
      type: "boolean",
      required: false,
      default: true,
    },
  ],
  output: {
    name: "sorted",
    type: "array",
    description: "정렬된 데이터 배열",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { data, key, ascending = true } = inputs;
      if (!Array.isArray(data)) {
        throw new Error("Input data must be an array");
      }

      const sorted = [...data].sort((a, b) => {
        if (a[key] < b[key]) return ascending ? -1 : 1;
        if (a[key] > b[key]) return ascending ? 1 : -1;
        return 0;
      });

      return sorted;
    } catch (error) {
      throw new Error(`Failed to sort data: ${(error as Error).message}`);
    }
  },
};

export const mapDataFunction: NodeFunction = {
  id: "map-data",
  name: "Map Data",
  description: "Maps array items by applying transformations",
  category: "Data",
  groups: ["default"],
  inputs: [
    {
      name: "data",
      type: "array",
      required: true,
    },
    {
      name: "key",
      type: "string",
      required: false,
      description: "Key to extract or modify (empty for whole item)",
    },
    {
      name: "targetKey",
      type: "string",
      required: false,
      description:
        "Target key to store result (default: replaces original key)",
    },
    {
      name: "transform",
      type: "string",
      required: false,
      default: "",
      description:
        "JavaScript expression to transform value (e.g., value.toUpperCase(), value * 2)",
    },
  ],
  output: {
    name: "mapped",
    type: "array",
    description: "변환된 데이터 배열",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { data, key, targetKey, transform } = inputs;
      if (!Array.isArray(data)) {
        throw new Error("Input data must be an array");
      }

      return data.map((item) => {
        const newItem = { ...item };

        // 키가 지정되지 않았으면 전체 아이템을 대상으로 함
        if (!key) {
          if (transform) {
            try {
              // eslint-disable-next-line no-new-func
              const transformFn = new Function("item", `return ${transform}`);
              return transformFn(item);
            } catch (e) {
              console.error("Transform error:", e);
              return item;
            }
          }
          return item;
        }

        // 특정 키의 값을 대상으로 함
        const value = item[key];
        let result = value;

        // 변환 표현식이 있으면 적용
        if (transform) {
          try {
            // eslint-disable-next-line no-new-func
            const transformFn = new Function("value", `return ${transform}`);
            result = transformFn(value);
          } catch (e) {
            console.error("Transform error:", e);
          }
        }

        // 결과를 지정된 타겟 키 또는 원래 키에 저장
        if (targetKey) {
          newItem[targetKey] = result;
        } else if (key) {
          newItem[key] = result;
        }

        return newItem;
      });
    } catch (error) {
      throw new Error(`Failed to map data: ${(error as Error).message}`);
    }
  },
};

export const delayFunction: NodeFunction = {
  id: "delay",
  name: "Delay",
  description: "Delays execution for the specified milliseconds",
  category: "Utils",
  groups: ["default"],
  inputs: [
    {
      name: "data",
      type: "object",
      required: true,
    },
    {
      name: "ms",
      type: "number",
      required: false,
      default: 1000,
    },
  ],
  output: {
    name: "data",
    type: "object",
    description: "지연 후 전달된 데이터",
  },
  execute: async (inputs: Record<string, any>) => {
    const { data, ms = 1000 } = inputs;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, ms);
    });
  },
};

// Discord 웹훅 함수
export const discordWebhookFunction: NodeFunction = {
  id: "discord-webhook",
  name: "Discord Webhook",
  description: "Discord 웹훅으로 메시지를 전송합니다",
  category: "Utils",
  groups: ["default", "solana"],
  inputs: [
    {
      name: "webhookUrl",
      type: "string",
      required: true,
      description: "Discord 웹훅 URL",
      default: "",
    },
    {
      name: "content",
      type: "string",
      required: true,
      description: "전송할 메시지 내용",
    },
  ],
  output: {
    name: "response",
    type: "object",
    description: "Discord 웹훅 응답",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      // 실제 요청에 사용할 URL과 내용
      let webhookUrl = inputs.webhookUrl || "";
      let content = inputs.content || "";

      console.log("inputs", inputs);

      // URL 또는 내용이 없으면 오류 발생
      if (!webhookUrl) {
        throw new Error("웹훅 URL이 제공되지 않았습니다");
      }

      if (!content) {
        throw new Error("전송할 메시지 내용이 비어있습니다");
      }

      // 실제 웹훅 전송 (지금은 테스트용으로 전송은 생략)
      const response = await sendToDiscord(webhookUrl, content);

      console.log("response", response);

      // 테스트용 응답 - 실제 구현 시 위의 주석 해제하고 실제 응답 반환
      return {
        result: true,
        content: content.substring(0, 50) + (content.length > 50 ? "..." : ""),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      // 에러 발생시 throw하여 노드가 에러 상태로 표시되도록 함
      throw new Error(`Discord 웹훅 처리 실패: ${(error as Error).message}`);
    }
  },
};

// Discord 웹훅 전송 함수 분리
async function sendToDiscord(webhookUrl: string, messageContent: string) {
  // 웹훅 요청 데이터 구성
  const webhook: Record<string, any> = { content: messageContent };

  // 웹훅 요청 보내기
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(webhook),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`웹훅 요청 실패 (${response.status}): ${errorText}`);
  }

  return {
    success: true,
    statusCode: response.status,
    message: "Discord 메시지가 성공적으로 전송되었습니다",
  };
}
