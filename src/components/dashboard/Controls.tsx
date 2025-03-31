"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFlow } from "@/components/providers/FlowProvider";
import { getFunctionsByCategory } from "@/lib/functions/registry";
import {
  Loader2,
  Play,
  Plus,
  Database,
  MoveHorizontal,
  Calculator,
} from "lucide-react";

const Controls = () => {
  const { addFunctionNode, addOutputNode, runFlow, isProcessing } = useFlow();
  const functionsByCategory = getFunctionsByCategory();

  const handleAddNode = (category: string, functionId: string) => {
    const func = functionsByCategory[category]?.find(
      (f) => f.id === functionId
    );
    if (!func) return;

    // 임의의 위치에 노드 추가 (좌표 직접 지정)
    const position = {
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
    };

    addFunctionNode(func, position);
  };

  const handleAddOutputNode = () => {
    const position = {
      x: Math.random() * 300 + 300,
      y: Math.random() * 300,
    };

    addOutputNode(position);
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    Data: <Database className="h-4 w-4" />,
    Analytics: <Calculator className="h-4 w-4" />,
    Utility: <MoveHorizontal className="h-4 w-4" />,
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Node Controls</CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <Button
          variant="default"
          className="w-full mb-4 mt-2"
          onClick={() => runFlow()}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Workflow
            </>
          )}
        </Button>

        <div className="text-sm font-medium mb-2">Add Nodes</div>

        <div className="space-y-3">
          {Object.entries(functionsByCategory).map(([category, functions]) => (
            <div key={category}>
              <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center">
                {categoryIcons[category] && (
                  <span className="mr-1">{categoryIcons[category]}</span>
                )}
                {category}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {functions.map((func) => (
                  <Button
                    key={func.id}
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start h-8 truncate"
                    onClick={() => handleAddNode(category, func.id)}
                    title={func.description}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {func.name}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">
              Output
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs w-full justify-start h-8"
              onClick={handleAddOutputNode}
            >
              <Plus className="h-3 w-3 mr-1" />
              Output Node
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Controls;
