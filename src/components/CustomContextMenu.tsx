import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getFunctionsByCategory,
  getFunctionsByGroupAndCategory,
} from "@/lib/functions/registry";
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
  FileSearch,
  MessageSquare,
  Coins,
  Layers,
  RefreshCw,
  Wrench,
  Calculator,
} from "lucide-react";
import { getDefaultGroup, getAllGroups } from "@/lib/functions/groups";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    deleteNode,
    duplicateNode,
    activeGroup,
    setActiveGroup,
    resetNode,
  } = useFlow();
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
    // 컨텍스트 메뉴를 닫지 않고 표시된 상태에서 그룹 변경 내용을 즉시 반영
  };

  // 함수별 아이콘 매핑
  const functionIcons: Record<string, React.ReactNode> = {
    "solana-tx-fetch": <FileSearch className="h-4 w-4 mr-2" />,
    "fetch-data": <Globe className="h-4 w-4 mr-2" />,
    "filter-data": <Filter className="h-4 w-4 mr-2" />,
    "sort-data": <SortAsc className="h-4 w-4 mr-2" />,
    "map-data": <Map className="h-4 w-4 mr-2" />,
    delay: <Clock className="h-4 w-4 mr-2" />,
    "discord-webhook": <MessageSquare className="h-4 w-4 mr-2" />,
    "analyze-solana-transaction": <Calculator className="h-4 w-4 mr-2" />,
  };

  // 카테고리 아이콘 매핑
  const categoryIcons: Record<string, React.ReactNode> = {
    Solana: <Coins className="h-4 w-4 mr-1" />,
    Data: <Database className="h-4 w-4 mr-1" />,
    Analytics: <Calculator className="h-4 w-4 mr-1" />,
    Utils: <Wrench className="h-4 w-4 mr-1" />,
  };

  // 카테고리 정렬 순서 지정
  const categoryOrder = ["Solana", "Data", "Analytics", "Utils"];
  const sortedCategories = Object.entries(functionsByCategory).sort(
    ([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  // 사용 가능한 그룹 목록
  const allGroups = getAllGroups();
  const activeGroupData = allGroups.find((group) => group.id === activeGroup);

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
        (f: any) => f.id === functionId
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

  // 노드 초기화 핸들러
  const handleResetNode = useCallback(() => {
    if (selectedNodeId) {
      resetNode(selectedNodeId);
      setVisible(false);
    }
  }, [resetNode, selectedNodeId]);

  if (!visible) return null;

  // 화면 바깥으로 메뉴가 나가지 않도록 조정
  const menuStyle: React.CSSProperties = {
    position: "fixed",
    top: Math.min(position.y, window.innerHeight - 320),
    left: Math.min(position.x, window.innerWidth - 180),
    zIndex: 1000,
    minWidth: "160px",
    maxWidth: "300px",
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
          <div className="text-sm font-semibold px-2 py-1 border-b truncate">
            {nodeName}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm"
            onClick={handleResetNode}
          >
            <RefreshCw className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">Reset Node</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm"
            onClick={handleDuplicateNode}
          >
            <CopyIcon className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">Duplicate Node</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sm text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={handleDeleteNode}
          >
            <Trash className="h-4 w-4 mr-2 shrink-0" />
            <span className="truncate">Delete Node</span>
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
          <BoxSelect className="h-4 w-4 mr-2 shrink-0" />
          <span className="truncate">Add Output Node</span>
        </Button>

        <div className="h-px bg-border my-2" />

        {sortedCategories.map(([category, functions]) => (
          <div key={category} className="space-y-1">
            <div className="text-xs font-semibold px-2 py-1 flex items-center truncate">
              {categoryIcons[category] && (
                <span className="shrink-0">{categoryIcons[category]}</span>
              )}
              <span className="truncate">{category}</span>
            </div>

            {functions.map((func: any) => (
              <Button
                key={func.id}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm"
                onClick={() => handleAddFunction(category, func.id)}
                title={func.description}
              >
                {functionIcons[func.id] ? (
                  <span className="shrink-0">{functionIcons[func.id]}</span>
                ) : (
                  <Database className="h-4 w-4 mr-2 shrink-0" />
                )}
                <span className="truncate">{func.name}</span>
              </Button>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CustomContextMenu;
