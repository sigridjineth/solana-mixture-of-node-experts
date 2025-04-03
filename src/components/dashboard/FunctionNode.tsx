"use client";

import React, { memo, useCallback } from "react";
import { Handle, Position } from "reactflow";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, AlertCircle } from "lucide-react";
import { cn, formatNodeData } from "@/lib/utils";
import { CustomNodeProps } from "@/types/node";
import { useFlow } from "@/components/providers/FlowProvider";
import { getFunctionById } from "@/lib/functions/registry";

const FunctionNode = memo(({ id, data, selected }: CustomNodeProps) => {
  const { runNode, updateNodeInputs } = useFlow();
  const nodeFunction = data.functionId
    ? getFunctionById(data.functionId)
    : undefined;

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
      if (
        nodeFunction?.id === "solana-history-insights" &&
        data.connectedInputs["result"]
      ) {
        return true;
      }

      return false;
    },
    [data.connectedInputs, nodeFunction?.id]
  );

  if (!nodeFunction) {
    return (
      <Card
        className={cn("min-w-64 shadow-md", selected && "ring-2 ring-primary")}
      >
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
        {/* 입력 필드들 */}
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
                <div className="flex items-center">
                  <Input
                    type="text"
                    value={data.inputs[input.name] || ""}
                    onChange={(e) =>
                      handleInputChange(input.name, e.target.value)
                    }
                    className="h-7 text-xs ml-1"
                    placeholder={input.description}
                    disabled={isInputDisabled(input.name)}
                  />
                </div>
                {/* 각 입력이 연결되었는지 상태 표시 */}
                {data.connectedInputs[input.name] !== undefined && (
                  <div
                    className="absolute rounded-full border-2 border-background"
                    style={{
                      zIndex: 20,
                      left: "-7px",
                      top: "3px",
                      width: "15px",
                      height: "15px",
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
              .filter(
                (input) =>
                  !input.hiddenUI &&
                  data.connectedInputs[input.name] !== undefined
              )
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
