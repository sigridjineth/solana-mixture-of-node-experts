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
import { generateId, isConnectionValid, topologicalSort } from "@/lib/utils";
import { getFunctionById } from "@/lib/functions/registry";

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
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string, position: XYPosition) => void;
  deleteEdge: (edgeId: string) => void;
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

      // 소스 노드의 반환값을 타겟 노드의 connectedInputs에 설정
      if (
        sourceNode &&
        targetNode &&
        sourceNode.data.returnValue !== undefined
      ) {
        const inputName = connection.targetHandle?.replace("input-", "") || "";
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === targetNode.id) {
              return {
                ...node,
                data: {
                  ...node.data,
                  connectedInputs: {
                    ...node.data.connectedInputs,
                    [inputName]: sourceNode.data.returnValue,
                  },
                },
              };
            }
            return node;
          })
        );
      }

      setEdges((eds) => addEdge(connection, newEdges));
    },
    [nodes, edges, setEdges, setNodes]
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
          connectedInputs: {}, // 연결된 입력값 초기화
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
          connectedInputs: {}, // 연결된 입력값 초기화
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
          returnValue: undefined, // 결과는 초기화
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

  // 엣지 삭제 함수
  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    },
    [setEdges]
  );

  // 단일 노드 실행
  const runNode = useCallback(
    async (nodeId: string, resultCache: Record<string, any> = {}) => {
      try {
        // 이미 이 노드가 실행되어 결과가 캐시에 있다면 다시 실행하지 않음
        if (resultCache[nodeId] !== undefined) {
          return resultCache[nodeId];
        }

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

        // 의존성 있는 노드들 먼저 실행하고 결과를 캐시에 저장
        const dependencyEdges = edges.filter((edge) => edge.target === nodeId);
        for (const edge of dependencyEdges) {
          const dependencyResult = await runNode(edge.source, resultCache);
          resultCache[edge.source] = dependencyResult;
        }

        // 현재 노드 실행 - 캐시에 의존성 노드 결과 전달
        const result = await executeNodeWithCache(
          nodeToRun,
          nodes,
          edges,
          resultCache
        );

        // 결과를 캐시에 저장
        resultCache[nodeId] = result;

        // 결과 업데이트
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  returnValue: result, // result를 returnValue로 저장
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

  // 노드 실행 함수 - 캐시를 활용
  const executeNodeWithCache = async (
    node: Node<NodeData>,
    nodes: Node<NodeData>[],
    edges: Edge[],
    resultCache: Record<string, any>
  ): Promise<any> => {
    if (!node.data.functionId) {
      return node.data.returnValue;
    }

    const nodeFunction = getFunctionById(node.data.functionId);
    if (!nodeFunction) {
      throw new Error(`Function not found: ${node.data.functionId}`);
    }

    // 입력 파라미터 수집 - connectedInputs가 우선순위를 가짐
    const inputs: Record<string, any> = {
      ...node.data.inputs, // 사용자가 직접 입력한 값
      ...node.data.connectedInputs, // 다른 노드로부터 연결된 값
    };

    // 연결된 노드에서 값 가져오기 - 캐시 우선
    const incomingEdges = edges.filter((edge) => edge.target === node.id);
    for (const edge of incomingEdges) {
      // 캐시에서 의존성 노드 결과 확인
      if (resultCache[edge.source] !== undefined) {
        // 타겟 핸들에서 입력 이름 추출
        const inputName = edge.targetHandle?.replace("input-", "") || "";
        inputs[inputName] = resultCache[edge.source];
      } else {
        // 캐시에 없으면 노드에서 직접 값 확인
        const sourceNode = nodes.find((n) => n.id === edge.source);
        if (!sourceNode || sourceNode.data.returnValue === undefined) {
          throw new Error(`Input node not processed yet: ${edge.source}`);
        }

        // 타겟 핸들에서 입력 이름 추출
        const inputName = edge.targetHandle?.replace("input-", "") || "";
        inputs[inputName] = sourceNode.data.returnValue;
      }
    }

    // 함수 실행
    return await nodeFunction.execute(inputs);
  };

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

      // 결과 캐시 초기화
      const resultCache: Record<string, any> = {};

      // 위상 정렬로 실행 순서 결정
      const sortedNodes = topologicalSort(nodes, edges);

      // 순서대로 노드 실행
      for (const node of sortedNodes) {
        await runNode(node.id, resultCache);
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
    setEdges,
    deleteNode,
    duplicateNode,
    deleteEdge,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};
