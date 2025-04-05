import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import type { AppKitNetwork } from '@reown/appkit/networks';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694';

if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const networks = [solana, solanaTestnet, solanaDevnet] as [
  AppKitNetwork,
  ...AppKitNetwork[]
];

// Set up Solana Adapter
export const solanaWeb3JsAdapter = new SolanaAdapter();
