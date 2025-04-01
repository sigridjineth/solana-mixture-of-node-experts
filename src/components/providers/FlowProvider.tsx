import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
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
import { getDefaultGroup } from "@/lib/functions/groups";

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
  activeGroup: string;
  setActiveGroup: (groupId: string) => void;
  resetNode: (nodeId: string) => void;
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
  const [activeGroup, setActiveGroup] = useState<string>("");

  // 초기 기본 그룹 설정
  useEffect(() => {
    const defaultGroup = getDefaultGroup();
    if (defaultGroup) {
      setActiveGroup(defaultGroup.id);
    }
  }, []);

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

  // 노드 초기화 함수
  const resetNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // 기존 노드 데이터 가져오기
            const functionId = node.data.functionId;
            let initialInputs = {};

            // 함수 노드인 경우 함수의 기본 입력값으로 초기화
            if (functionId) {
              const func = getFunctionById(functionId);
              if (func) {
                initialInputs = func.inputs.reduce((acc, input) => {
                  if (input.default !== undefined) {
                    acc[input.name] = input.default;
                  }
                  return acc;
                }, {} as Record<string, any>);
              }
            }

            return {
              ...node,
              data: {
                ...node.data,
                inputs: initialInputs,
                connectedInputs: {},
                returnValue: undefined,
                error: undefined,
                loading: false,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
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

        // 의존성 있는 노드들 먼저 실행
        const dependencyEdges = edges.filter((edge) => edge.target === nodeId);

        // 모든 의존성 노드를 병렬로 실행
        const dependencyPromises = dependencyEdges.map(async (edge) => {
          try {
            // 소스 노드가 있는지 확인
            const sourceNode = nodes.find((node) => node.id === edge.source);
            if (!sourceNode) {
              throw new Error(`소스 노드를 찾을 수 없습니다: ${edge.source}`);
            }

            // 소스 노드 실행 및 결과 캐싱
            const dependencyResult = await runNode(edge.source, resultCache);
            resultCache[edge.source] = dependencyResult;
            return {
              success: true,
              sourceId: edge.source,
              inputName: edge.targetHandle?.replace("input-", "") || "",
              result: dependencyResult,
            };
          } catch (error) {
            // 소스 노드 실행 중 오류 발생
            return {
              success: false,
              sourceId: edge.source,
              inputName: edge.targetHandle?.replace("input-", "") || "",
              error: (error as Error).message,
            };
          }
        });

        // 모든 의존성 실행을 병렬로 처리하고 결과 수집
        const dependencyResults = await Promise.all(dependencyPromises);
        const failedDependencies = dependencyResults.filter(
          (res) => !res.success
        );

        // 의존성 실행 실패 시 오류 처리
        if (failedDependencies.length > 0) {
          const errorMessages = failedDependencies
            .map((dep) => `소스 노드 ${dep.sourceId} 실행 실패: ${dep.error}`)
            .join(", ");
          throw new Error(`의존성 노드 실행 실패: ${errorMessages}`);
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

    // 입력 파라미터 수집
    const inputs: Record<string, any> = { ...node.data.inputs };
    const connectedInputs: Record<string, any> = {}; // 연결된 입력값을 추적

    // 연결된 노드에서 값 가져오기 (이미 실행된 노드의 결과 사용)
    const incomingEdges = edges.filter((edge) => edge.target === node.id);

    // 병렬 처리를 위해 모든 입력 소스 노드의 결과를 한 번에 수집
    await Promise.all(
      incomingEdges.map(async (edge) => {
        const sourceNodeId = edge.source;
        const sourceNode = nodes.find((n) => n.id === sourceNodeId);

        // 캐시에서 소스 노드의 결과 확인
        const cachedResult = resultCache[sourceNodeId];

        // 결과가 캐시에 없고, 노드의 returnValue도 없는 경우에만 에러
        if (
          cachedResult === undefined &&
          (!sourceNode || sourceNode.data.returnValue === undefined)
        ) {
          throw new Error(
            `소스 노드가 아직 실행되지 않았습니다. 먼저 실행하세요.`
          );
        }

        // 타겟 핸들에서 입력 이름 추출
        const inputName = edge.targetHandle?.replace("input-", "") || "";
        if (inputName) {
          // 캐시에 결과가 있으면 캐시 값을 사용, 없으면 노드의 returnValue를 사용
          const value =
            cachedResult !== undefined
              ? cachedResult
              : sourceNode?.data.returnValue;

          inputs[inputName] = value;
          connectedInputs[inputName] = value; // 연결된 입력값 추적
        }
      })
    );

    // 노드 상태에 연결된 입력값 업데이트
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === node.id) {
          return {
            ...n,
            data: {
              ...n.data,
              connectedInputs: {
                ...n.data.connectedInputs,
                ...connectedInputs,
              },
            },
          };
        }
        return n;
      })
    );

    // 함수 실행
    const result = await nodeFunction.execute(inputs);

    // 특별한 타입 처리
    if (
      nodeFunction.id === "mermaid" &&
      typeof result === "object" &&
      result.type === "mermaid"
    ) {
      // 노드를 mermaid 타입으로 변경
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              type: "mermaid",
              data: {
                ...n.data,
                isProcessing: false,
                returnValue: result,
                hasError: false,
                errorMessage: "",
                mermaid: result,
              },
            };
          }
          return n;
        })
      );
    } else {
      // 일반 함수 결과 처리
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              data: {
                ...n.data,
                isProcessing: false,
                returnValue: result,
                hasError: false,
                errorMessage: "",
              },
            };
          }
          return n;
        })
      );
    }

    return result;
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

      // 노드 레벨별로 그룹화하여 동일 레벨은 병렬 실행
      const nodeLevels: Record<number, Node<NodeData>[]> = {};

      // 각 노드의 최대 깊이 계산 (모든 의존성 노드의 최대 깊이 + 1)
      const nodeDepths: Record<string, number> = {};

      // 의존성 그래프 생성
      const dependencyGraph: Record<string, string[]> = {};
      nodes.forEach((node) => {
        dependencyGraph[node.id] = [];
      });

      edges.forEach((edge) => {
        if (dependencyGraph[edge.target]) {
          dependencyGraph[edge.target].push(edge.source);
        }
      });

      // 노드 깊이 계산 함수
      const calculateNodeDepth = (nodeId: string): number => {
        // 이미 계산된 깊이가 있으면 반환
        if (nodeDepths[nodeId] !== undefined) {
          return nodeDepths[nodeId];
        }

        // 의존성이 없으면 깊이는 0
        const dependencies = dependencyGraph[nodeId] || [];
        if (dependencies.length === 0) {
          nodeDepths[nodeId] = 0;
          return 0;
        }

        // 의존성의 최대 깊이 + 1이 현재 노드의 깊이
        const maxDependencyDepth = Math.max(
          ...dependencies.map((depId) => calculateNodeDepth(depId))
        );

        nodeDepths[nodeId] = maxDependencyDepth + 1;
        return nodeDepths[nodeId];
      };

      // 모든 노드의 깊이 계산
      sortedNodes.forEach((node) => {
        const depth = calculateNodeDepth(node.id);
        if (!nodeLevels[depth]) {
          nodeLevels[depth] = [];
        }
        nodeLevels[depth].push(node);
      });

      // 각 레벨별로 노드 실행 (같은 레벨은 병렬 실행)
      const levels = Object.keys(nodeLevels).sort(
        (a, b) => Number(a) - Number(b)
      );
      for (const level of levels) {
        const nodesInLevel = nodeLevels[Number(level)];

        // 동일 레벨의 노드들은 병렬로 실행
        await Promise.all(
          nodesInLevel.map((node) => runNode(node.id, resultCache))
        );
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
    activeGroup,
    setActiveGroup,
    resetNode,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
};
