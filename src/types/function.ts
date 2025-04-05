export type FunctionInputType = "string" | "number" | "boolean" | "object" | "array" | "password";

export type FunctionInput = {
  name: string;
  type: FunctionInputType;
  required: boolean;
  default?: any;
  description?: string;
  hiddenUI?: boolean;
  isApiKeyInput?: boolean;
};

export type FunctionOutput = {
  name: string;
  type: FunctionInputType;
  description: string;
};

export type NodeFunction = {
  id: string;
  name: string;
  description: string;
  category: string;
  groups?: string[];
  inputs: FunctionInput[];
  output: FunctionOutput;
  execute: (inputs: Record<string, any>) => Promise<any>;
};

export type FunctionRegistry = Record<string, NodeFunction>;

export type NodeFunctionGroup = {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
};
