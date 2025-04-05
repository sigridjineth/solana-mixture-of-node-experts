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
  solanaOrcaFunction,
  solanaJupyterFunction,
  solanaRaydiumFunction,
  solanaHuggingFaceFunction,
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
  solanaOrcaFunction,
  solanaJupyterFunction,
  solanaRaydiumFunction,
  solanaHuggingFaceFunction,
];

export { solanaWalletConnectFunction, solanaSendTransactionFunction } from "./solana-functions";
