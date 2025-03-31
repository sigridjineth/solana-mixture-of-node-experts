import { NodeProps } from "reactflow";

export type NodeData = {
  label: string;
  functionId?: string;
  inputs: Record<string, any>;
  result?: any;
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
