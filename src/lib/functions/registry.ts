import { NodeFunction, FunctionRegistry } from "@/types/function";
import {
  fetchDataFunction,
  filterDataFunction,
  sortDataFunction,
  calculateStatisticsFunction,
  delayFunction,
} from "./node-functions";

// 모든 함수들을 레지스트리에 등록
const functionRegistry: FunctionRegistry = {
  [fetchDataFunction.id]: fetchDataFunction,
  [filterDataFunction.id]: filterDataFunction,
  [sortDataFunction.id]: sortDataFunction,
  [calculateStatisticsFunction.id]: calculateStatisticsFunction,
  [delayFunction.id]: delayFunction,
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

export default functionRegistry;
