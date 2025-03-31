"use client";

import React, { useCallback, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Play, Save, Upload } from "lucide-react";
import { useFlow } from "@/components/providers/FlowProvider";
import NodeContextMenu from "./NodeContextMenu";
import FunctionNode from "./FunctionNode";
import OutputNode from "./OutputNode";

// 노드 타입 정의
const nodeTypes = {
  function: FunctionNode,
  output: OutputNode,
};

const NodeDashboard = () => {
  const flowInstance = useRef<ReactFlowInstance | null>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    runFlow,
    isProcessing,
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

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        snapToGrid
        attributionPosition="bottom-right"
      >
        <NodeContextMenu
          flowInstance={flowInstance.current as ReactFlowInstance}
        >
          <Background />
        </NodeContextMenu>

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
            onClick={handleLoadFlow}
          >
            <Upload className="h-4 w-4" />
            Load
          </Button>
        </Panel>
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
