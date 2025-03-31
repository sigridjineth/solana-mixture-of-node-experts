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
        {nodeFunction.inputs.map((input) => (
          <div key={input.name} className="mb-2">
            <div className="text-xs text-muted-foreground mb-1">
              {input.name}
            </div>
            <div className="flex items-center">
              <Handle
                type="target"
                position={Position.Left}
                id={`input-${input.name}`}
                className="rounded-full bg-primary border-2 border-background"
                style={{
                  width: "10px",
                  height: "10px",
                  minWidth: "10px",
                  minHeight: "10px",
                }}
              />
              <Input
                type="text"
                value={data.inputs[input.name] || ""}
                onChange={(e) => handleInputChange(input.name, e.target.value)}
                className="h-7 text-xs ml-2"
                placeholder={input.description}
                disabled={!!data.connectedInputs[input.name]}
              />
            </div>
            {/* 연결된 입력값 표시 */}
            {data.connectedInputs[input.name] !== undefined && (
              <div className="mt-1">
                <div className="text-xs text-muted-foreground mb-1">
                  Connected value
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
            )}
          </div>
        ))}

        {/* 출력 핸들 */}
        <div className="mt-2">
          <div className="text-xs text-muted-foreground mb-1">Output</div>
          <div className="flex items-center">
            <Handle
              type="source"
              position={Position.Right}
              id="output"
              className="rounded-full bg-primary border-2 border-background"
              style={{
                width: "10px",
                height: "10px",
                minWidth: "10px",
                minHeight: "10px",
              }}
            />
          </div>
        </div>

        {/* 반환값 표시 */}
        {data.returnValue !== undefined && (
          <div className="mt-2">
            <div className="text-xs text-muted-foreground mb-1">
              Return Value
            </div>
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

      <CardFooter className="p-1 flex justify-end">
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          className="rounded-full bg-primary border-2 border-background"
          style={{
            width: "10px",
            height: "10px",
            minWidth: "10px",
            minHeight: "10px",
          }}
        />
      </CardFooter>
    </Card>
  );
});

FunctionNode.displayName = "FunctionNode";

export default FunctionNode;
