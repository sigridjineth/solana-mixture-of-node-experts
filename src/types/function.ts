export type FunctionInput = {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  default?: any;
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
  inputs: FunctionInput[];
  output: FunctionOutput;
  execute: (inputs: Record<string, any>) => Promise<any>;
};

export type FunctionRegistry = Record<string, NodeFunction>;
