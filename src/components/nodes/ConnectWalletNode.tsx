import React from "react";

import { useAppKit } from "@reown/appkit/react";

interface ConnectWalletNodeProps {
  data: {
    returnValue?: {
      connected: boolean;
      network?: string;
      address?: string;
      balance?: number;
      message: string;
    };
  };
}

const ConnectWalletNode: React.FC<ConnectWalletNodeProps> = ({ data }) => {
  const { open } = useAppKit();
  const walletInfo = data.returnValue;

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center mb-3">
        <h3 className="font-medium text-sm">Connect Wallet</h3>
      </div>

      {!walletInfo ? (
        <div className="text-sm text-gray-500">
          <p>Connect your wallet to see information</p>
          <button
            onClick={() => open()}
            className="mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-xs hover:bg-purple-200 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : walletInfo.connected ? (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Network:</span>
            <span className="font-medium">{walletInfo.network || "mainnet-beta"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Address:</span>
            <span className="font-medium truncate max-w-[150px]">
              {walletInfo.address
                ? `${walletInfo.address.slice(0, 4)}...${walletInfo.address.slice(-4)}`
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Balance:</span>
            <span className="font-medium">{walletInfo.balance?.toFixed(4) || "0"} SOL</span>
          </div>
          <div className="mt-3 text-xs text-green-600">{walletInfo.message}</div>
        </div>
      ) : (
        <div className="text-sm text-amber-600">
          <p>{walletInfo.message}</p>
          <button
            onClick={() => open()}
            className="mt-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-md text-xs hover:bg-amber-200 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWalletNode;
