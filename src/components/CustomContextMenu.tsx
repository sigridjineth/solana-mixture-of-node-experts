import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getFunctionsByCategory } from "@/lib/functions/registry";
import { useFlow } from "@/components/providers/FlowProvider";
import { XYPosition } from "reactflow";
import {
  Trash,
  CopyIcon,
  BoxSelect,
  Database,
  Globe,
  Filter,
  SortAsc,
  Map,
  BarChart,
  Clock,
} from "lucide-react";

const CustomContextMenu = () => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [flowPosition, setFlowPosition] = useState<XYPosition | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const {
    addFunctionNode,
    addOutputNode,
    nodes,
    setNodes,
    deleteNode,
    duplicateNode,
  } = useFlow();
  const functionsByCategory = getFunctionsByCategory();

  // 함수별 아이콘 매핑
  const functionIcons: Record<string, React.ReactNode> = {
    "fetch-data": <Globe className="h-4 w-4" />,
    "filter-data": <Filter className="h-4 w-4" />,
    "sort-data": <SortAsc className="h-4 w-4" />,
    "map-data": <Map className="h-4 w-4" />,
    "calculate-statistics": <BarChart className="h-4 w-4" />,
    delay: <Clock className="h-4 w-4" />,
  };

  // 메뉴 표시 이벤트 리스너
  useEffect(() => {
    const handleShowMenu = (e: Event) => {
      const customEvent = e as CustomEvent;
      setPosition({
        x: customEvent.detail.x,
        y: customEvent.detail.y,
      });
      setFlowPosition(customEvent.detail.position);
      setSelectedNodeId(customEvent.detail.nodeId || null);
      setVisible(true);
    };

    // 문서 클릭 시 메뉴 닫기
    const handleDocumentClick = (e: MouseEvent) => {
      if (visible) {
        setVisible(false);
      }
    };

    document.addEventListener("showNodeMenu", handleShowMenu);
    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("showNodeMenu", handleShowMenu);
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [visible]);

  // 함수 추가 핸들러
  const handleAddFunction = useCallback(
    (category: string, functionId: string) => {
      if (!flowPosition) return;

      const func = functionsByCategory[category]?.find(
        (f) => f.id === functionId
      );
      if (func) {
        addFunctionNode(func, flowPosition);
        setVisible(false);
      }
    },
    [functionsByCategory, addFunctionNode, flowPosition]
  );

  // 출력 노드 추가 핸들러
  const handleAddOutput = useCallback(() => {
    if (!flowPosition) return;

    addOutputNode(flowPosition);
    setVisible(false);
  }, [addOutputNode, flowPosition]);

  // 노드 삭제 핸들러
  const handleDeleteNode = useCallback(() => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
      setVisible(false);
    }
  }, [deleteNode, selectedNodeId]);

  // 노드 복제 핸들러
  const handleDuplicateNode = useCallback(() => {
    if (selectedNodeId && flowPosition) {
      duplicateNode(selectedNodeId, flowPosition);
      setVisible(false);
    }
  }, [duplicateNode, selectedNodeId, flowPosition]);

  if (!visible) return null;

  // 화면 바깥으로 메뉴가 나가지 않도록 조정
  const menuStyle: React.CSSProperties = {
    position: "fixed",
    top: Math.min(position.y, window.innerHeight - 320),
    left: Math.min(position.x, window.innerWidth - 200),
    zIndex: 1000,
    minWidth: "180px",
    maxHeight: "80vh",
    overflowY: "auto",
  };

  // 선택된 노드가 있는 경우 노드 관련 메뉴 표시
  if (selectedNodeId) {
    const selectedNode = nodes.find((node) => node.id === selectedNodeId);
    const nodeName = selectedNode?.data.label || "Node";

    return (
      <Card style={menuStyle} className="p-2 shadow-lg">
        <div className="space-y-2">
          <div className="text-sm font-semibold px-2 py-1 border-b">
            {nodeName}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDeleteNode}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Node
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm"
            onClick={handleDuplicateNode}
          >
            <CopyIcon className="h-4 w-4 mr-2" />
            Duplicate Node
          </Button>
        </div>
      </Card>
    );
  }

  // 일반 컨텍스트 메뉴 (노드가 선택되지 않은 경우)
  return (
    <Card style={menuStyle} className="p-2 shadow-lg">
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sm"
          onClick={handleAddOutput}
        >
          <BoxSelect className="h-4 w-4 mr-2" />
          Add Output Node
        </Button>

        <div className="h-px bg-border my-2" />

        {Object.entries(functionsByCategory).map(([category, functions]) => (
          <div key={category} className="space-y-1">
            <div className="text-xs font-semibold px-2 py-1">{category}</div>

            {functions.map((func) => (
              <Button
                key={func.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => handleAddFunction(category, func.id)}
                title={func.description}
              >
                {functionIcons[func.id] || (
                  <Database className="h-4 w-4 mr-2" />
                )}
                <span className="ml-2">{func.name}</span>
              </Button>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CustomContextMenu;
