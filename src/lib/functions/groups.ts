import { NodeFunctionGroup } from "@/types/function";

// Node function group definitions
export const FUNCTION_GROUPS = {
  solana: {
    id: "solana",
    name: "Solana",
    description: "Nodes for fetching Solana blockchain data and basic operations.",
    isDefault: true, // Default active group
  },
  utilities: {
    id: "utilities",
    name: "Utilities",
    description: "Nodes for data processing, transformation, and general operations.",
  },
  crosschain: {
    id: "crosschain",
    name: "Cross-Chain",
    description: "Nodes for cross-chain interoperability, privacy, and bridging operations.",
  },
  finfra: {
    id: "finfra",
    name: "Financial Infrastructure",
    description: "Advanced financial infrastructure nodes for Solana mainnet, SVM, and side-chains.",
  },
  defi: {
    id: "defi",
    name: "DeFi",
    description: "Decentralized finance operations including swaps, liquidity, and yield strategies.",
  },
  infra: {
    id: "infra",
    name: "Infrastructure",
    description: "Nodes for blockchain infrastructure optimization and management.",
  },
};

// Get group information by group ID
export const getGroupById = (groupId: string) => {
  return FUNCTION_GROUPS[groupId as keyof typeof FUNCTION_GROUPS];
};

// Get default active group
export const getDefaultGroup = () => {
  return FUNCTION_GROUPS.solana;
};

// Get all groups
export const getAllGroups = () => {
  return Object.values(FUNCTION_GROUPS);
};
