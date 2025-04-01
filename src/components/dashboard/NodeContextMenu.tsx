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
import { getAllGroups } from "@/lib/functions/groups";
import { useFlow } from "@/components/providers/FlowProvider";
import { ReactFlowInstance } from "reactflow";

type ContextMenuProps = {
  children: React.ReactNode;
  flowInstance: ReactFlowInstance;
};

const NodeContextMenu = ({ children, flowInstance }: ContextMenuProps) => {
  const { addFunctionNode, addOutputNode, activeGroup, setActiveGroup } =
    useFlow();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [functionsByCategory, setFunctionsByCategory] = useState<
    Record<string, any>
  >({});

  // 초기화 시 기본 그룹 설정
  useEffect(() => {
    // 초기화는 FlowProvider에서 처리하므로 여기서는 함수 카테고리만 설정
    if (activeGroup) {
      setFunctionsByCategory(getFunctionsByGroupAndCategory(activeGroup));
    } else {
      setFunctionsByCategory(getFunctionsByCategory());
    }
  }, [activeGroup]);

  // 그룹 변경 처리
  const handleGroupChange = (groupId: string) => {
    setActiveGroup(groupId);
    // 그룹 변경 시 함수 카테고리는 위의 useEffect에서 자동으로 업데이트됨
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
      // 현재 활성화된 그룹의 함수 목록에서 찾기
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
  const categoryOrder = ["Solana", "Data", "Tx Tools", "Utils"];
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
      <ContextMenuContent className="w-40 max-w-[160px]">
        <ContextMenuItem onClick={() => handleAddOutput()}>
          Add Output Node
        </ContextMenuItem>
        <ContextMenuSeparator />
        {sortedCategories.map(([category, functions]) => (
          <ContextMenuSub key={category}>
            <ContextMenuSubTrigger>{category}</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-40 max-w-[160px]">
              {functions.map((func: any) => (
                <ContextMenuItem
                  key={func.id}
                  onClick={() => handleAddFunction(func.id, category)}
                  className="flex items-center"
                >
                  <span className="truncate max-w-[100px]">{func.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">
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
