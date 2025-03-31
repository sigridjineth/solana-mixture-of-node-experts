"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFlow } from "@/components/providers/FlowProvider";
import {
  getFunctionsByCategory,
  getFunctionsByGroupAndCategory,
} from "@/lib/functions/registry";
import { getAllGroups, getDefaultGroup } from "@/lib/functions/groups";
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
  FileSearch,
  MessageSquare,
  Coins,
  Layers,
} from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Controls = () => {
  const { addFunctionNode, addOutputNode, runFlow, isProcessing } = useFlow();
  const [activeGroup, setActiveGroup] = useState<string>("");
  const [functionsByCategory, setFunctionsByCategory] = useState<
    Record<string, any>
  >({});

  // 초기화 시 기본 그룹 설정
  useEffect(() => {
    const defaultGroup = getDefaultGroup();
    if (defaultGroup) {
      setActiveGroup(defaultGroup.id);
      setFunctionsByCategory(getFunctionsByGroupAndCategory(defaultGroup.id));
    } else {
      setFunctionsByCategory(getFunctionsByCategory());
    }
  }, []);

  // 그룹 변경 처리
  const handleGroupChange = (groupId: string) => {
    setActiveGroup(groupId);
    setFunctionsByCategory(getFunctionsByGroupAndCategory(groupId));
  };

  const handleAddNode = (category: string, functionId: string) => {
    const func = functionsByCategory[category]?.find(
      (f: any) => f.id === functionId
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
    Solana: <Coins className="h-4 w-4" />,
    Data: <Database className="h-4 w-4" />,
    Analytics: <Calculator className="h-4 w-4" />,
    Utility: <MoveHorizontal className="h-4 w-4" />,
    SNS: <MessageSquare className="h-4 w-4" />,
  };

  // 함수별 아이콘 매핑
  const functionIcons: Record<string, React.ReactNode> = {
    "solana-tx-fetch": <FileSearch className="h-4 w-4" />,
    "fetch-data": <Globe className="h-4 w-4" />,
    "filter-data": <Filter className="h-4 w-4" />,
    "sort-data": <SortAsc className="h-4 w-4" />,
    "map-data": <Map className="h-4 w-4" />,
    "calculate-statistics": <BarChart className="h-4 w-4" />,
    delay: <Clock className="h-4 w-4" />,
    "discord-webhook": <MessageSquare className="h-4 w-4" />,
    "analyze-solana-transaction": <Coins className="h-4 w-4" />,
  };

  // 카테고리 정렬 순서 지정
  const categoryOrder = ["Solana", "SNS", "Data", "Analytics", "Utility"];
  const sortedCategories = Object.entries(functionsByCategory).sort(
    ([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  // 사용 가능한 그룹 목록
  const allGroups = getAllGroups();
  const activeGroupData = allGroups.find((group) => group.id === activeGroup);

  return (
    <Card className="shadow-md">
      <CardHeader className="p-3 pb-1 flex flex-row justify-between items-center">
        <CardTitle className="text-sm">Node Controls</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 px-0 flex items-center justify-center"
              title={activeGroupData?.name || "모든 도구"}
            >
              <Layers className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {allGroups.map((group) => (
              <DropdownMenuItem
                key={group.id}
                onClick={() => handleGroupChange(group.id)}
                className={activeGroup === group.id ? "bg-muted" : ""}
              >
                {group.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs font-medium">Add Nodes</div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs"
            onClick={handleAddOutputNode}
          >
            <BoxSelect className="h-3 w-3 mr-1" />
            Output
          </Button>
        </div>
        <div className="space-y-2">
          {sortedCategories.map(([category, functions]) => (
            <div key={category}>
              <div className="text-xs font-semibold text-muted-foreground mb-1 flex items-center">
                {categoryIcons[category] && (
                  <span className="mr-1">{categoryIcons[category]}</span>
                )}
                {category}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {functions.map((func: any) => (
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
        </div>
      </CardContent>
    </Card>
  );
};

export default Controls;
