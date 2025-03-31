import { NodeProps } from "reactflow";

export type NodeData = {
  label: string;
  functionId?: string;
  inputs: Record<string, any>; // 사용자가 직접 입력한 값
  returnValue?: any; // 함수의 반환값
  connectedInputs: Record<string, any>; // 다른 노드로부터 연결된 입력값
  isProcessing?: boolean;
  hasError?: boolean;
  errorMessage?: string;
};

export type CustomNodeProps = NodeProps<NodeData>;

export type ConnectionData = {
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
};
