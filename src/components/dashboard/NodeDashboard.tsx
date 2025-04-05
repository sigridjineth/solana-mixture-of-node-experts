"use client";

import React, { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  ReactFlowInstance,
  OnConnectStart,
  OnConnectEnd,
  Connection,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Play, Save, Upload, RefreshCw, Server, Copy, Check } from "lucide-react";
import { useFlow } from "@/components/providers/FlowProvider";
import FunctionNode from "./FunctionNode";
import OutputNode from "./OutputNode";
import { MermaidViewer } from "./nodes/MermaidViewer";
import CustomEdge from "../flow/CustomEdge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// 노드 타입 정의
const nodeTypes = {
  function: FunctionNode,
  output: OutputNode,
  mermaid: MermaidViewer,
};

// 엣지 타입 정의
const edgeTypes = {
  custom: CustomEdge,
};

const NodeDashboard = () => {
  const flowInstance = useRef<ReactFlowInstance | null>(null);
  const [connectionStartHandle, setConnectionStartHandle] = useState<{
    nodeId: string;
    handleId: string;
  } | null>(null);
  const [isMcpDialogOpen, setIsMcpDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    runFlow,
    isProcessing,
    deleteEdge,
    setNodes,
    setEdges,
    resetWorkflow,
  } = useFlow();

  const onInit = useCallback((instance: ReactFlowInstance) => {
    flowInstance.current = instance;
  }, []);

  // 워크플로우 실행
  const handleRunFlow = useCallback(() => {
    runFlow().catch(console.error);
  }, [runFlow]);

  // 워크플로우 저장
  const handleSaveFlow = useCallback(() => {
    if (!flowInstance.current) return;

    const flow = flowInstance.current.toObject();
    const flowJson = JSON.stringify(flow);

    // 파일로 저장
    const blob = new Blob([flowJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `node-workflow-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // 워크플로우 로드
  const handleLoadFlow = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (!event.target?.result) return;

          const flow = JSON.parse(event.target.result as string);

          if (flowInstance.current && flow.nodes && flow.edges) {
            flowInstance.current.setNodes(flow.nodes);
            flowInstance.current.setEdges(flow.edges);
          }
        } catch (error) {
          console.error("Failed to load workflow:", error);
          alert("Failed to load workflow. Invalid file format.");
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }, []);

  // 워크플로우 초기화
  const handleResetWorkflow = useCallback(() => {
    if (window.confirm("현재 워크플로우를 초기화하시겠습니까?")) {
      resetWorkflow();
    }
  }, [resetWorkflow]);

  // 컨텍스트 메뉴 핸들러
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    // 브라우저 기본 컨텍스트 메뉴 방지
    event.preventDefault();

    if (!flowInstance.current) return;

    // 노드 ID 찾기
    const target = event.target as HTMLElement;
    const nodeElement = target.closest(".react-flow__node");
    const nodeId = nodeElement?.getAttribute("data-id");

    // 마우스 좌표를 ReactFlow 좌표로 변환
    const rect = (event.target as HTMLElement).closest(".react-flow")?.getBoundingClientRect();

    if (rect) {
      const position = flowInstance.current.project({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });

      // 커스텀 이벤트 발생시키기
      const customEvent = new CustomEvent("showNodeMenu", {
        detail: {
          position,
          x: event.clientX,
          y: event.clientY,
          nodeId,
        },
      });
      document.dispatchEvent(customEvent);
    }
  }, []);

  // 연결 시작 핸들러
  const handleConnectStart: OnConnectStart = useCallback((event, params) => {
    setConnectionStartHandle({
      nodeId: params.nodeId || "",
      handleId: params.handleId || "",
    });
  }, []);

  // 연결 종료 핸들러 - 드래그 방식 연결 해제 비활성화
  const handleConnectEnd: OnConnectEnd = useCallback(() => {
    setConnectionStartHandle(null);
  }, []);

  // 커스텀 onConnect 핸들러 - 모든 엣지를 custom 타입으로 설정
  const handleConnect = useCallback(
    (connection: Connection) => {
      // custom 타입의 엣지로 생성
      const customConnection = {
        ...connection,
        type: "custom",
      };

      onConnect(customConnection);
    },
    [onConnect]
  );

  // MCP 서버 설정 가져오기
  const handleGetMcpServer = useCallback(() => {
    setIsMcpDialogOpen(true);
  }, []);

  const handleCopyConfig = useCallback(() => {
    const config = {
      "solana-analyzer": {
        command: "npx",
        args: ["solana-node-workflow-mcp"],
      },
    };

    const configText = JSON.stringify(config, null, 2);
    navigator.clipboard
      .writeText(configText)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy configuration:", err);
      });
  }, []);

  return (
    <div className="w-full h-full">
      <ReactFlow
        onContextMenu={handleContextMenu}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: "custom" }}
        onInit={onInit}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        fitView
        snapToGrid
        attributionPosition="bottom-right"
      >
        <Background />
        <Controls />

        <Panel position="top-right" className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleRunFlow}
            disabled={isProcessing || nodes.length === 0}
          >
            {isProcessing ? (
              <>Running...</>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Flow
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleResetWorkflow}
            disabled={isProcessing || nodes.length === 0}
            title="워크플로우 초기화"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleSaveFlow}
            disabled={nodes.length === 0}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleGetMcpServer}
          >
            <Server className="h-4 w-4" />
            Get MCP Server
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleLoadFlow}
          >
            <Upload className="h-4 w-4" />
            Load
          </Button>
        </Panel>

        <Dialog open={isMcpDialogOpen} onOpenChange={setIsMcpDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>MCP Server Configuration</DialogTitle>
              <DialogDescription>
                Add this configuration to your claude_desktop_config.json file
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <div className="bg-muted p-4 rounded-md font-mono text-sm whitespace-pre overflow-x-auto">
                  {`{
  "solana-analyzer": {
    "command": "npx",
    "args": ["solana-node-workflow-mcp"]
  }
}`}
                </div>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 shrink-0"
                onClick={handleCopyConfig}
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">Copy configuration</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </ReactFlow>
    </div>
  );
};

// ReactFlow Provider로 감싸서 내보내기
const NodeDashboardWithProvider = () => {
  return (
    <ReactFlowProvider>
      <NodeDashboard />
    </ReactFlowProvider>
  );
};

export default NodeDashboardWithProvider;
