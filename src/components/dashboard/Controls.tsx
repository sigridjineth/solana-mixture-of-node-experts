"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFlow } from "@/components/providers/FlowProvider";
import { getFunctionsByCategory } from "@/lib/functions/registry";
import {
  Loader2,
  Play,
  Database,
  MoveHorizontal,
  Calculator,
  Globe,
  Filter,
  SortAsc,
  Map,
  BarChart,
  Clock,
  BoxSelect,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // 함수별 아이콘 매핑
  const functionIcons: Record<string, React.ReactNode> = {
    "fetch-data": <Globe className="h-4 w-4" />,
    "filter-data": <Filter className="h-4 w-4" />,
    "sort-data": <SortAsc className="h-4 w-4" />,
    "map-data": <Map className="h-4 w-4" />,
    "calculate-statistics": <BarChart className="h-4 w-4" />,
    delay: <Clock className="h-4 w-4" />,
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm">Node Controls</CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        <Button
          variant="default"
          className="w-full mb-3 mt-1 h-8 text-xs"
          onClick={() => runFlow()}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-3 w-3 mr-1" />
              Run Workflow
            </>
          )}
        </Button>

        <div className="text-xs font-medium mb-2">Add Nodes</div>

        <div className="space-y-2">
          {Object.entries(functionsByCategory).map(([category, functions]) => (
            <div key={category}>
              <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center">
                {categoryIcons[category] && (
                  <span className="mr-1">{categoryIcons[category]}</span>
                )}
                {category}
              </div>

              <div className="grid grid-cols-3 gap-1">
                {functions.map((func) => (
                  <TooltipProvider key={func.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-full p-0 flex justify-center items-center"
                          onClick={() => handleAddNode(category, func.id)}
                        >
                          {functionIcons[func.id] || (
                            <Database className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{func.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {func.description}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          ))}

          <div>
            <div className="text-xs font-semibold text-muted-foreground mb-1">
              Output
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-1/3 p-0 flex justify-center items-center"
                    onClick={handleAddOutputNode}
                  >
                    <BoxSelect className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Output Node</p>
                  <p className="text-xs text-muted-foreground">
                    Node that displays the final output
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Controls;
