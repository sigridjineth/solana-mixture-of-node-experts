"use client";

import { useCallback, useState, useEffect } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  getFunctionsByCategory,
  getFunctionsByGroupAndCategory,
} from "@/lib/functions/registry";
import { getDefaultGroup, getAllGroups } from "@/lib/functions/groups";
import { useFlow } from "@/components/providers/FlowProvider";
import { ReactFlowInstance } from "reactflow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Layers } from "lucide-react";

type ContextMenuProps = {
  children: React.ReactNode;
  flowInstance: ReactFlowInstance;
};

const NodeContextMenu = ({ children, flowInstance }: ContextMenuProps) => {
  const { addFunctionNode, addOutputNode } = useFlow();
  const [position, setPosition] = useState({ x: 0, y: 0 });
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

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const pane = flowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setPosition(pane);
    },
    [flowInstance]
  );

  const handleAddFunction = useCallback(
    (functionId: string, category: string) => {
      const func = functionsByCategory[category]?.find(
        (f: any) => f.id === functionId
      );
      if (func) {
        addFunctionNode(func, position);
      }
    },
    [addFunctionNode, functionsByCategory, position]
  );

  const handleAddOutput = useCallback(() => {
    addOutputNode(position);
  }, [addOutputNode, position]);

  // 추가: 카테고리 정렬 순서
  const categoryOrder = ["Solana", "SNS", "Data", "Analytics", "Utility"];
  const sortedCategories = Object.entries(functionsByCategory).sort(
    ([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  // 사용 가능한 그룹 목록
  const allGroups = getAllGroups();
  const activeGroupData = allGroups.find((group) => group.id === activeGroup);

  return (
    <ContextMenu>
      <ContextMenuTrigger
        onContextMenu={handleContextMenu}
        className="w-full h-full z-10"
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => handleAddOutput()}>
          Add Output Node
        </ContextMenuItem>
        <ContextMenuSeparator />
        <div className="px-2 py-1 flex items-center justify-between">
          <span className="text-xs">그룹 선택</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 px-0 flex items-center justify-center"
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
        </div>
        <ContextMenuSeparator />
        {sortedCategories.map(([category, functions]) => (
          <ContextMenuSub key={category}>
            <ContextMenuSubTrigger>{category}</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {functions.map((func: any) => (
                <ContextMenuItem
                  key={func.id}
                  onClick={() => handleAddFunction(func.id, category)}
                >
                  {func.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {func.inputs.length > 0 ? `${func.inputs.length} in` : ""}
                  </span>
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default NodeContextMenu;
