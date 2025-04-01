import { NodeFunction, FunctionRegistry } from "@/types/function";
import {
  fetchDataFunction,
  filterDataFunction,
  sortDataFunction,
  mapDataFunction,
  delayFunction,
  solanaTxFetchFunction,
  discordWebhookFunction,
} from "./node-functions";
import {
  analyzeSolanaTransactionFunction,
  solanaTxToMermaidFunction,
} from "./solana-functions";
import { mermaidFunction } from "./utils-functions";

// 모든 함수들을 레지스트리에 등록
const functionRegistry: FunctionRegistry = {
  [fetchDataFunction.id]: fetchDataFunction,
  [filterDataFunction.id]: filterDataFunction,
  [sortDataFunction.id]: sortDataFunction,
  [mapDataFunction.id]: mapDataFunction,
  [delayFunction.id]: delayFunction,
  [solanaTxFetchFunction.id]: solanaTxFetchFunction,
  [discordWebhookFunction.id]: discordWebhookFunction,
  [analyzeSolanaTransactionFunction.id]: analyzeSolanaTransactionFunction,
  [solanaTxToMermaidFunction.id]: solanaTxToMermaidFunction,
  [mermaidFunction.id]: mermaidFunction,
};

export const getFunctionById = (id: string): NodeFunction | undefined => {
  return functionRegistry[id];
};

export const getAllFunctions = (): NodeFunction[] => {
  return Object.values(functionRegistry);
};

export const getFunctionsByCategory = (): Record<string, NodeFunction[]> => {
  const categories: Record<string, NodeFunction[]> = {};

  getAllFunctions().forEach((func) => {
    if (!categories[func.category]) {
      categories[func.category] = [];
    }
    categories[func.category].push(func);
  });

  return categories;
};

export const getFunctionsByGroup = (groupId: string): NodeFunction[] => {
  return getAllFunctions().filter((func) => {
    // 모든 노드가 groups 배열을 가지고 있다고 가정
    const groups = func.groups || [];
    return groups.includes(groupId);
  });
};

export const getFunctionsByGroupAndCategory = (
  groupId: string
): Record<string, NodeFunction[]> => {
  const functions = getFunctionsByGroup(groupId);
  const categories: Record<string, NodeFunction[]> = {};

  functions.forEach((func) => {
    if (!categories[func.category]) {
      categories[func.category] = [];
    }
    categories[func.category].push(func);
  });

  return categories;
};

export default functionRegistry;
