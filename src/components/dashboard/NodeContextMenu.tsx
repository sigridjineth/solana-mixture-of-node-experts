"use client";

import { useCallback, useState } from "react";
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
import { getFunctionsByCategory } from "@/lib/functions/registry";
import { useFlow } from "@/components/providers/FlowProvider";
import { ReactFlowInstance } from "reactflow";

type ContextMenuProps = {
  children: React.ReactNode;
  flowInstance: ReactFlowInstance;
};

const NodeContextMenu = ({ children, flowInstance }: ContextMenuProps) => {
  const { addFunctionNode, addOutputNode } = useFlow();
  const functionsByCategory = getFunctionsByCategory();
  const [menuPosition, setMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();

      // 마우스 좌표를 ReactFlow 좌표로 변환
      const rect = (event.target as HTMLElement)
        .closest(".react-flow")
        ?.getBoundingClientRect();

      if (rect && flowInstance) {
        const position = flowInstance.project({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });

        // 메뉴 위치 저장
        setMenuPosition(position);
      }
    },
    [flowInstance]
  );

  const handleAddFunction = useCallback(
    (functionId: string, category: string) => {
      const func = functionsByCategory[category].find(
        (f) => f.id === functionId
      );
      if (func && menuPosition) {
        addFunctionNode(func, menuPosition);
        setMenuPosition(null); // 메뉴 닫기
      }
    },
    [functionsByCategory, addFunctionNode, menuPosition]
  );

  const handleAddOutput = useCallback(() => {
    if (menuPosition) {
      addOutputNode(menuPosition);
      setMenuPosition(null); // 메뉴 닫기
    }
  }, [addOutputNode, menuPosition]);

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
        {Object.entries(functionsByCategory).map(([category, functions]) => (
          <ContextMenuSub key={category}>
            <ContextMenuSubTrigger>{category}</ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-48">
              {functions.map((func) => (
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
