"use client";

import React, { memo, useCallback, useState } from "react";
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
        {/* 함수 입력들 */}
        {nodeFunction.inputs.map((input) => (
          <div key={input.name} className="mb-2">
            <div className="text-xs text-muted-foreground mb-1">
              {input.name}{" "}
              {input.required && <span className="text-red-500">*</span>}
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
                size={1}
                placeholder={`${input.type}`}
                value={data.inputs[input.name] || ""}
                onChange={(e) => handleInputChange(input.name, e.target.value)}
                className="h-7 text-xs ml-2"
              />
            </div>
          </div>
        ))}

        {/* 함수 결과 */}
        {data.result !== undefined && (
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-1 flex justify-between items-center">
              <span>Result ({nodeFunction.output.type})</span>
              {nodeFunction.output.type === "object" &&
                Object.keys(data.result || {}).length > 10 && (
                  <Badge
                    variant="outline"
                    className="text-[10px] py-0 px-1.5 h-4"
                  >
                    스크롤바 사용
                  </Badge>
                )}
            </div>
            <div
              className="bg-muted p-2 rounded-md text-xs font-mono whitespace-pre-wrap custom-scrollbar"
              style={{
                overflowY: "auto",
                maxHeight: "240px",
                overflowX: "hidden",
              }}
            >
              {formatNodeData(data.result)}
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {data.hasError && (
          <div className="mt-2 p-2 bg-red-100 text-red-800 rounded-md text-xs flex items-start">
            <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span>{data.errorMessage}</span>
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
