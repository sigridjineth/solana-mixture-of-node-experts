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
  solanaAccountHistoryFunction,
  solanaHistoryInsightsFunction,
  solanaTxClassifyExpertFunction,
  solanaTxExpertAnalyzeFunction,
  modelProviderSelectorFunction,
  solanaWalletConnectFunction,
  solanaSendTransactionFunction,
  solanaOrcaFunction,
  solanaJupyterFunction,
  solanaRaydiumFunction,
} from "./solana-functions";
import { mermaidFunction } from "./utils-functions";

// Register all functions in the registry
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
  [solanaAccountHistoryFunction.id]: solanaAccountHistoryFunction,
  [mermaidFunction.id]: mermaidFunction,
  [solanaHistoryInsightsFunction.id]: solanaHistoryInsightsFunction,
  [solanaTxClassifyExpertFunction.id]: solanaTxClassifyExpertFunction,
  [solanaTxExpertAnalyzeFunction.id]: solanaTxExpertAnalyzeFunction,
  [modelProviderSelectorFunction.id]: modelProviderSelectorFunction,
  [solanaWalletConnectFunction.id]: solanaWalletConnectFunction,
  [solanaSendTransactionFunction.id]: solanaSendTransactionFunction,
  [solanaOrcaFunction.id]: solanaOrcaFunction,
  [solanaJupyterFunction.id]: solanaJupyterFunction,
  [solanaRaydiumFunction.id]: solanaRaydiumFunction,
};

export const getFunctionById = (id: string): NodeFunction | undefined => {
  return functionRegistry[id];
};

export const getAllFunctions = (): NodeFunction[] => {
  return Object.values(functionRegistry);
};

export const getFunctionsByGroup = (groupId: string): NodeFunction[] => {
  // Assume all nodes have a groups array
  return getAllFunctions().filter((func) => func.groups?.includes(groupId));
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

export const getFunctionsByGroupAndCategory = (groupId: string): Record<string, NodeFunction[]> => {
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

export const getFunctionsByInputType = (inputType: string): NodeFunction[] => {
  return getAllFunctions().filter((func) => func.inputs.some((input) => input.type === inputType));
};

export const getFunctionsByOutputType = (outputType: string): NodeFunction[] => {
  return getAllFunctions().filter((func) => func.output.type === outputType);
};

export default functionRegistry;
