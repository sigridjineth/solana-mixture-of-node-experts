import { NodeFunction, FunctionInputType } from "@/types/function";

export const mermaidFunction: NodeFunction = {
  id: "mermaid",
  name: "Mermaid Viewer",
  description:
    "Mermaid 다이어그램을 이미지로 변환하고 클릭 시 확대하여 볼 수 있는 뷰어를 제공합니다",
  category: "Utils",
  groups: ["default", "solana"],
  inputs: [
    {
      name: "mermaid",
      type: "string" as FunctionInputType,
      required: true,
      description: "변환할 Mermaid 다이어그램 코드",
    },
  ],
  output: {
    name: "viewer",
    type: "object" as FunctionInputType,
    description: "다이어그램 뷰어 컴포넌트 데이터",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { mermaid } = inputs;

      if (!mermaid) {
        throw new Error("Mermaid 코드는 필수 입력값입니다");
      }

      // API 호출 없이 직접 결과 반환
      return {
        mermaid: mermaid, // 렌더링을 위한 원본 Mermaid 코드
        type: "mermaid", // 타입 정보 추가
      };
    } catch (error) {
      throw new Error(`Mermaid 이미지 변환 실패: ${(error as Error).message}`);
    }
  },
};
