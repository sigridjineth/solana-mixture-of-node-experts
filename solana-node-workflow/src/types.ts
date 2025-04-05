export interface TransactionAnalysis {
  signature: string;
  analysis: string;
  mermaid?: string;
}

export interface MCPOutput {
  type: string;
  data: Record<string, any>;
}

export interface MCPError {
  type: "error";
  data: {
    message: string;
  };
}
