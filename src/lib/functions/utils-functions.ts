import { NodeFunction, FunctionInputType } from "@/types/function";

// Mermaid 다이어그램 변환 노드
export const mermaidFunction: NodeFunction = {
  id: "mermaid",
  name: "Mermaid Viewer",
  description: "Converts Mermaid diagrams to images and provides a viewer with zoom functionality",
  category: "Utils",
  groups: ["utils"],
  inputs: [
    {
      name: "mermaid",
      type: "string",
      required: true,
      description: "Mermaid diagram code to convert",
    },
  ],
  output: {
    name: "viewer",
    type: "object" as FunctionInputType,
    description: "Diagram viewer component data",
  },
  execute: async (inputs: Record<string, any>) => {
    try {
      const { mermaid } = inputs;

      if (!mermaid) {
        throw new Error("Mermaid code is a required input");
      }

      // API 호출 없이 직접 결과 반환
      return {
        mermaid: mermaid, // 렌더링을 위한 원본 Mermaid 코드
        type: "mermaid", // 타입 정보 추가
      };
    } catch (error) {
      throw new Error(`Failed to convert Mermaid diagram: ${(error as Error).message}`);
    }
  },
};
