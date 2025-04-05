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
];

export { solanaWalletConnectFunction, solanaSendTransactionFunction } from "./solana-functions";
