import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  XYPosition,
} from "reactflow";
import { NodeData } from "@/types/node";
import { NodeFunction } from "@/types/function";
import {
  generateId,
  executeNode,
  isConnectionValid,
  topologicalSort,
} from "@/lib/utils";

type FlowContextType = {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addFunctionNode: (func: NodeFunction, position: XYPosition) => void;
  addOutputNode: (position: XYPosition) => void;
  runFlow: () => Promise<void>;
  runNode: (nodeId: string) => Promise<void>;
  updateNodeInputs: (nodeId: string, inputs: Record<string, any>) => void;
  isProcessing: boolean;
  setNodes: (
    nodes: Node<NodeData>[] | ((nds: Node<NodeData>[]) => Node<NodeData>[])
  ) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string, position: XYPosition) => void;
};

const FlowContext = createContext<FlowContextType | null>(null);

export const useFlow = () => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error("useFlow must be used within a FlowProvider");
  }
  return context;
};

type FlowProviderProps = {
  children: ReactNode;
};

export const FlowProvider = ({ children }: FlowProviderProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // 노드 입력 업데이트
  const updateNodeInputs = useCallback(
    (nodeId: string, inputs: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                inputs: {
                  ...node.data.inputs,
                  ...inputs,
                },
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  // 연결 핸들러
  const onConnect = useCallback(
    (connection: Connection) => {
      // 연결 가능 여부 확인
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (
        !isConnectionValid(
          sourceNode,
          targetNode,
          connection.sourceHandle,
          connection.targetHandle
        )
      ) {
        return;
      }

      // 기존 연결 확인 및 제거 (타겟 핸들을 중복 연결하지 않도록)
      const newEdges = edges.filter(
        (edge) =>
          !(
            edge.target === connection.target &&
            edge.targetHandle === connection.targetHandle
          )
      );

      setEdges((eds) => addEdge(connection, newEdges));
    },
    [nodes, edges, setEdges]
  );

  // 함수 노드 추가
  const addFunctionNode = useCallback(
    (func: NodeFunction, position: XYPosition) => {
      const newNode: Node<NodeData> = {
        id: generateId(),
        type: "function",
        position,
        data: {
          label: func.name,
          functionId: func.id,
          inputs: func.inputs.reduce((acc, input) => {
            if (input.default !== undefined) {
              acc[input.name] = input.default;
            }
            return acc;
          }, {} as Record<string, any>),
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  // 출력 노드 추가
  const addOutputNode = useCallback(
    (position: XYPosition) => {
      const newNode: Node<NodeData> = {
        id: generateId(),
        type: "output",
        position,
        data: {
          label: "Output",
          inputs: {},
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  // 노드 삭제 함수
  const deleteNode = useCallback(
    (nodeId: string) => {
      // 노드와 연결된 모든 엣지도 삭제
      setEdges((edges) =>
        edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );

      // 노드 삭제
      setNodes((nodes) => nodes.filter((node) => node.id !== nodeId));
    },
    [setNodes, setEdges]
  );

  // 노드 복제 함수
  const duplicateNode = useCallback(
    (nodeId: string, position: XYPosition) => {
      const sourceNode = nodes.find((node) => node.id === nodeId);
      if (!sourceNode) return;

      // 새로운 ID로 노드 복제
      const newNodeId = generateId();
      const offset = { x: 50, y: 50 }; // 원본 노드와 약간 떨어진 위치에 배치

      const newNode: Node<NodeData> = {
        ...sourceNode,
        id: newNodeId,
        position: position, // 또는 {x: sourceNode.position.x + offset.x, y: sourceNode.position.y + offset.y}
        data: {
          ...sourceNode.data,
          result: undefined, // 결과는 초기화
          isProcessing: false,
          hasError: false,
          errorMessage: undefined,
        },
        selected: false, // 선택 상태 초기화
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, setNodes]
  );

  // 단일 노드 실행
  const runNode = useCallback(
    async (nodeId: string) => {
      try {
        // 노드 처리 중 상태로 설정
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  isProcessing: true,
                  hasError: false,
                  errorMessage: undefined,
                },
              };
            }
            return node;
          })
        );

        const nodeToRun = nodes.find((node) => node.id === nodeId);
        if (!nodeToRun) {
          throw new Error(`Node not found: ${nodeId}`);
        }

        // 의존성 있는 노드들 먼저 실행
        const dependencyEdges = edges.filter((edge) => edge.target === nodeId);
        for (const edge of dependencyEdges) {
          await runNode(edge.source);
        }

        // 현재 노드 실행
        const result = await executeNode(nodeToRun, nodes, edges);

        // 결과 업데이트
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  result,
                  isProcessing: false,
                },
              };
            }
            return node;
          })
        );

        return result;
      } catch (error) {
        // 에러 상태 업데이트
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  isProcessing: false,
                  hasError: true,
                  errorMessage: (error as Error).message,
                },
              };
            }
            return node;
          })
        );

        throw error;
      }
    },
    [nodes, edges, setNodes]
  );

  // 전체 플로우 실행
  const runFlow = useCallback(async () => {
    try {
      setIsProcessing(true);

      // 모든 노드 상태 초기화
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: {
            ...node.data,
            isProcessing: false,
            hasError: false,
            errorMessage: undefined,
          },
        }))
      );

      // 위상 정렬로 실행 순서 결정
      const sortedNodes = topologicalSort(nodes, edges);

      // 순서대로 노드 실행
      for (const node of sortedNodes) {
        await runNode(node.id);
      }
    } catch (error) {
      console.error("Flow execution error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [nodes, edges, runNode, setNodes]);

  const value = {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addFunctionNode,
    addOutputNode,
    runFlow,
    runNode,
    updateNodeInputs,
    isProcessing,
    setNodes,
    deleteNode,
    duplicateNode,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};
