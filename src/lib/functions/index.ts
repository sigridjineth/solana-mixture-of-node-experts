import {
  analyzeSolanaTransactionFunction,
  solanaAccountHistoryFunction,
  solanaTxToMermaidFunction,
  solanaHistoryInsightsFunction,
  solanaTxClassifyExpertFunction,
  solanaTxExpertAnalyzeFunction,
  modelProviderSelectorFunction,
  solanaWalletConnectFunction,
  solanaSendTransactionFunction,
} from "./solana-functions";

export const nodeFunctions = [
  analyzeSolanaTransactionFunction,
  solanaAccountHistoryFunction,
  solanaTxToMermaidFunction,
  solanaHistoryInsightsFunction,
  solanaTxClassifyExpertFunction,
  solanaTxExpertAnalyzeFunction,
  modelProviderSelectorFunction,
  solanaWalletConnectFunction,
  solanaSendTransactionFunction,
];

export { solanaWalletConnectFunction, solanaSendTransactionFunction } from "./solana-functions";
