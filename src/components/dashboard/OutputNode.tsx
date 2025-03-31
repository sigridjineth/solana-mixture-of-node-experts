"use client";

import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn, formatNodeData } from "@/lib/utils";
import { CustomNodeProps } from "@/types/node";

const OutputNode = memo(({ id, data, selected }: CustomNodeProps) => {
  return (
    <Card
      className={cn("shadow-md relative", selected && "ring-2 ring-primary")}
      style={{ width: "280px" }}
      data-node-id={id}
    >
      <CardHeader className="p-3 pb-2">
        <CardTitle className="text-sm font-medium">{data.label}</CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        <div className="text-xs text-muted-foreground mb-1">Input</div>
        <div className="flex items-center mb-4">
          <Handle
            type="target"
            position={Position.Left}
            id="input"
            className="rounded-full bg-primary border-2 border-background"
            style={{
              width: "10px",
              height: "10px",
              minWidth: "10px",
              minHeight: "10px",
            }}
          />
          <div className="ml-2 text-xs">Connect from a function node</div>
        </div>

        {/* 출력 결과 */}
        {data.result !== undefined && (
          <div className="mt-2">
            <div className="text-xs text-muted-foreground mb-1">Result</div>
            <div
              className="bg-muted p-2 rounded-md text-xs font-mono custom-scrollbar"
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
      </CardContent>
    </Card>
  );
});

OutputNode.displayName = "OutputNode";

export default OutputNode;
