"use client";

import { useCallback } from "react";
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

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      // 마우스 좌표를 ReactFlow 좌표로 변환
      const rect = (event.target as HTMLElement)
        .closest(".react-flow")
        ?.getBoundingClientRect();

      if (rect && flowInstance) {
        const position = flowInstance.project({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });

        // 컨텍스트 메뉴의 데이터를 이벤트에 저장
        (event as any).flowPosition = position;
      }
    },
    [flowInstance]
  );

  const handleAddFunction = useCallback(
    (functionId: string, category: string, event: React.MouseEvent) => {
      const func = functionsByCategory[category].find(
        (f) => f.id === functionId
      );
      if (func && (event as any).flowPosition) {
        addFunctionNode(func, (event as any).flowPosition);
      }
    },
    [functionsByCategory, addFunctionNode]
  );

  const handleAddOutput = useCallback(
    (event: React.MouseEvent) => {
      if ((event as any).flowPosition) {
        addOutputNode((event as any).flowPosition);
      }
    },
    [addOutputNode]
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger
        onContextMenu={handleContextMenu}
        className="w-full h-full"
      >
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleAddOutput}>
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
                  onClick={(e) => handleAddFunction(func.id, category, e)}
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
