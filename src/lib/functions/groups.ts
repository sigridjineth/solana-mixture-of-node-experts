import { NodeFunctionGroup } from "@/types/function";

// 노드 함수 그룹 정의
export const functionGroups: NodeFunctionGroup[] = [
  {
    id: "default_group",
    name: "기본 도구",
    description: "데이터 처리, 변환, 그리고 일반적인 작업을 위한 노드들",
  },
  {
    id: "solana_group",
    name: "Solana 도구",
    description: "Solana 블록체인 데이터 가져오기 및 분석을 위한 노드들",
    isDefault: true, // 기본 활성화 그룹
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
