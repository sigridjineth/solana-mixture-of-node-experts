export type FunctionInput = {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  default?: any;
  description?: string;
};

export type FunctionOutput = {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
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
