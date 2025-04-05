"use client";

import React, { memo, useCallback, useEffect } from "react";
import { Handle, Position } from "reactflow";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, AlertCircle, Link } from "lucide-react";
import { cn, formatNodeData } from "@/lib/utils";
import { CustomNodeProps } from "@/types/node";
import { useFlow } from "@/components/providers/FlowProvider";
import { getFunctionById } from "@/lib/functions/registry";
import ConnectWalletNode from "../nodes/ConnectWalletNode";
import SendTransactionNode from "../nodes/SendTransactionNode";

const FunctionNode = memo(({ id, data, selected }: CustomNodeProps) => {
  const { runNode, updateNodeInputs } = useFlow();
  const nodeFunction = data.functionId ? getFunctionById(data.functionId) : undefined;

  // Add a debug log to see when connectedInputs changes
  useEffect(() => {
    if (nodeFunction?.id === "solana-send-transaction") {
      console.log("SendTransactionNode connectedInputs in FunctionNode:", data.connectedInputs);
    }
  }, [data.connectedInputs, nodeFunction?.id]);

  const handleInputChange = useCallback(
    (name: string, value: string) => {
      updateNodeInputs(id, { [name]: value });
    },
    [id, updateNodeInputs]
  );

  const handleRun = useCallback(() => {
    runNode(id).catch(console.error);
  }, [id, runNode]);

  // SolTx Intelligence 노드에서 result가 연결되었을 때 다른 입력들도 비활성화
  const isInputDisabled = useCallback(
    (inputName: string) => {
      // 기본적으로 해당 입력에 연결된 값이 있으면 비활성화
      if (!!data.connectedInputs[inputName]) {
        return true;
      }

      // SolTx Intelligence 노드이고 result가 연결되었으면 모든 입력 비활성화
      if (nodeFunction?.id === "solana-history-insights" && data.connectedInputs["result"]) {
        return true;
      }

      return false;
    },
    [data.connectedInputs, nodeFunction?.id]
  );

  // 선택형 입력을 위한 옵션 목록
  const getInputOptions = useCallback(
    (inputName: string) => {
      // Model Selector 노드의 provider 옵션
      if (nodeFunction?.id === "model-provider-selector" && inputName === "provider") {
        return [
          { value: "huggingface", label: "Hugging Face" },
          { value: "openrouter", label: "OpenRouter" },
        ];
      }

      // Model Selector 노드의 model 옵션 (provider에 따라 다름)
      if (nodeFunction?.id === "model-provider-selector" && inputName === "model") {
        const provider = data.inputs["provider"] || "huggingface";

        if (provider === "huggingface") {
          return [
            {
              label: "Mixture of Multi-chain Expert 1 Pro",
              value: "mome-1.0-pro-exp",
            },
            {
              label: "Mixture of Multi-chain Expert 1",
              value: "mome-1.0",
            },
          ];
        } else if (provider === "openrouter") {
          return [
            { label: "GPT-4o-mini", value: "openai/gpt-4o-mini" },
            { label: "GPT-o1-mini", value: "openai/o1-mini" },
            {
              label: "Claude 3.5 Sonnet",
              value: "anthropic/claude-3.5-sonnet",
            },
            {
              label: "Claude 3.7 Sonnet",
              value: "anthropic/claude-3.7-sonnet",
            },
            { label: "Gemini 2.0 Flash", value: "google/gemini-2.0-flash" },
            { label: "Gemini 1.5 Pro", value: "google/gemini-1.5-pro" },
          ];
        }
      }

      return [];
    },
    [nodeFunction?.id, data.inputs]
  );

  // 입력이 선택형 입력인지 확인
  const isSelectInput = useCallback(
    (inputName: string) => {
      if (nodeFunction?.id === "model-provider-selector") {
        return inputName === "provider" || inputName === "model";
      }
      return false;
    },
    [nodeFunction?.id]
  );

  // 입력이 API 키 입력인지 확인 (비밀번호 타입으로 표시)
  const isApiKeyInput = useCallback(
    (inputName: string) => {
      if (nodeFunction?.id === "model-provider-selector") {
        return inputName === "apiKey";
      }
      return false;
    },
    [nodeFunction?.id]
  );

  // Custom node rendering for specific function types
  if (nodeFunction?.id === "solana-wallet-connect") {
    return (
      <div
        className={cn(
          "relative rounded-lg border bg-card text-card-foreground shadow-sm",
          selected && "ring-2 ring-primary"
        )}
        style={{ width: "280px" }}
      >
        <ConnectWalletNode data={data} />
      </div>
    );
  }

  if (nodeFunction?.id === "solana-send-transaction") {
    return (
      <div
        className={cn(
          "relative rounded-lg border bg-card text-card-foreground shadow-sm",
          selected && "ring-2 ring-primary"
        )}
        style={{ width: "280px" }}
      >
        <SendTransactionNode data={data} />
      </div>
    );
  }

  if (!nodeFunction) {
    return (
      <Card className={cn("min-w-64 shadow-md", selected && "ring-2 ring-primary")}>
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Function not found</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "shadow-md relative",
        selected && "ring-2 ring-primary",
        data.hasError && "border-red-500"
      )}
      style={{ width: "280px" }}
      data-node-id={id}
    >
      <CardHeader className="p-3 pb-2 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
          <Badge variant="outline" className="mt-1 text-xs">
            {nodeFunction.category}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleRun}
          disabled={data.isProcessing}
        >
          {data.isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        <div className="mb-4">
          <div className="text-xs font-semibold mb-2">Inputs</div>
          {nodeFunction.inputs
            .filter((input) => !input.hiddenUI)
            .map((input) => (
              <div key={input.name} className="mb-3 relative">
                <div className="text-xs text-muted-foreground mb-1 flex items-center relative">
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={`input-${input.name}`}
                    className="rounded-full bg-primary border-2 border-background handle-visible"
                    style={{
                      width: "12px",
                      height: "12px",
                      minWidth: "12px",
                      minHeight: "12px",
                      left: "-6px",
                      zIndex: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      position: "absolute",
                    }}
                  />
                  <span className="bg-primary/10 rounded-sm px-1 py-0.5 ml-3 mr-1">
                    {input.name}
                  </span>
                  {input.required && <span className="text-red-500">*</span>}
                </div>

                {isSelectInput(input.name) ? (
                  <select
                    className="w-full border rounded-md p-1 text-sm"
                    value={data.inputs[input.name] || input.default || ""}
                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                    disabled={isInputDisabled(input.name)}
                  >
                    <option value="">선택하세요...</option>
                    {getInputOptions(input.name).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : isApiKeyInput(input.name) ? (
                  <Input
                    type="password"
                    className="w-full"
                    value={data.inputs[input.name] || input.default || ""}
                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                    disabled={isInputDisabled(input.name)}
                    placeholder={input.description || input.name}
                  />
                ) : (
                  <Input
                    type="text"
                    className="w-full"
                    value={data.inputs[input.name] || input.default || ""}
                    onChange={(e) => handleInputChange(input.name, e.target.value)}
                    disabled={isInputDisabled(input.name)}
                    placeholder={input.description || input.name}
                  />
                )}

                {data.connectedInputs[input.name] !== undefined && (
                  <div
                    className="absolute rounded-full border-1 border-background"
                    style={{
                      zIndex: 20,
                      left: "-5px",
                      top: "5px",
                      width: "10px",
                      height: "10px",
                      backgroundColor: "#10b981",
                      boxShadow: "0 0 2px rgba(0,0,0,0.3)",
                    }}
                  />
                )}
              </div>
            ))}
        </div>

        {/* 연결된 입력값들 - 모든 입력 필드 아래에 표시 */}
        {Object.keys(data.connectedInputs).length > 0 && (
          <div className="mt-3 mb-2">
            <div className="text-xs font-semibold mb-2">Connected Values</div>
            {nodeFunction.inputs
              .filter((input) => !input.hiddenUI && data.connectedInputs[input.name] !== undefined)
              .map((input) => (
                <div key={`connected-${input.name}`} className="mb-2">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center">
                    <span className="bg-primary/10 rounded-sm px-1 py-0.5 ml-3 mr-1">
                      {input.name}
                    </span>
                  </div>
                  <div
                    className="bg-muted p-2 rounded-md text-xs font-mono custom-scrollbar"
                    style={{
                      overflowY: "auto",
                      maxHeight: "60px",
                      overflowX: "hidden",
                    }}
                  >
                    {formatNodeData(data.connectedInputs[input.name])}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* 출력 핸들 - 단일 출력 핸들만 유지 */}
        <div className="mt-4">
          <div className="text-xs font-semibold mb-2">Output</div>
          <div className="flex items-center justify-end relative h-8">
            <div className="text-xs text-muted-foreground relative flex items-center">
              <span className="bg-primary/10 rounded-sm px-1 py-0.5 mr-6">
                {nodeFunction.output.name}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id="output"
                className="rounded-full bg-primary border-2 border-background handle-visible"
                style={{
                  width: "12px",
                  height: "12px",
                  minWidth: "12px",
                  minHeight: "12px",
                  right: "-6px",
                  zIndex: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  position: "absolute",
                }}
              />
            </div>
          </div>
        </div>

        {/* 반환값 표시 */}
        {data.returnValue !== undefined && (
          <div className="mt-3">
            <div className="text-xs font-semibold mb-1">Return Value</div>
            <div
              className="bg-muted p-2 rounded-md text-xs font-mono custom-scrollbar"
              style={{
                overflowY: "auto",
                maxHeight: "240px",
                overflowX: "hidden",
              }}
            >
              {formatNodeData(data.returnValue)}
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {data.hasError && (
          <div className="mt-2 flex items-center text-xs text-red-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            {data.errorMessage}
          </div>
        )}
      </CardContent>

      {/* CardFooter에서 중복된 출력 핸들 제거 */}
      <CardFooter className="p-2 flex justify-end">
        {data.isProcessing && (
          <div className="text-xs text-muted-foreground flex items-center">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            처리 중...
          </div>
        )}
      </CardFooter>
    </Card>
  );
});

FunctionNode.displayName = "FunctionNode";

export default FunctionNode;
