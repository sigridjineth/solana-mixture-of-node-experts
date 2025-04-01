import { NodeFunctionGroup } from "@/types/function";

// 노드 함수 그룹 정의
export const functionGroups: NodeFunctionGroup[] = [
  {
    id: "solana",
    name: "Solana Tool",
    description: "Solana 블록체인 데이터 가져오기 및 기본 작업을 위한 노드들",
    isDefault: true, // 기본 활성화 그룹
  },
  {
    id: "default",
    name: "Default Tool",
    description: "데이터 처리, 변환, 그리고 일반적인 작업을 위한 노드들",
  },
];

// 그룹 ID로 그룹 정보 가져오기
export const getGroupById = (
  groupId: string
): NodeFunctionGroup | undefined => {
  return functionGroups.find((group) => group.id === groupId);
};

// 기본 활성화 그룹 가져오기
export const getDefaultGroup = (): NodeFunctionGroup | undefined => {
  return functionGroups.find((group) => group.isDefault);
};

// 모든 그룹 가져오기
export const getAllGroups = (): NodeFunctionGroup[] => {
  return functionGroups;
};
