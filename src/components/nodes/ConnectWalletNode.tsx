import React, { useEffect, useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useAppKitConnection, type Provider } from "@reown/appkit-adapter-solana/react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

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

  const { address } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const [balance, setBalance] = useState<number | null>(null);
  const [network, setNetwork] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (!address || !connection || !walletProvider?.publicKey) {
        setIsConnected(false);
        return;
      }

      setIsConnected(true);

      try {
        // Get SOL balance
        const balanceInLamports = await connection.getBalance(walletProvider.publicKey);
        const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
        setBalance(balanceInSOL);

        // Get network
        const networkType = connection.rpcEndpoint.includes("devnet")
          ? "devnet"
          : connection.rpcEndpoint.includes("testnet")
          ? "testnet"
          : "mainnet-beta";
        setNetwork(networkType);
      } catch (error) {
        console.error("Error fetching wallet info:", error);
      }
    };

    fetchWalletInfo();
  }, [address, connection, walletProvider?.publicKey]);

  const handleConnect = async () => {
    try {
      open();
      // Use the wallet provider's connect method
      if (walletProvider) {
        await walletProvider.connect();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Use the wallet provider's disconnect method
      if (walletProvider) {
        await walletProvider.disconnect();
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <h3 className="font-medium text-sm">Solana Wallet</h3>
        </div>
        {isConnected ? (
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button variant="default" size="sm" onClick={handleConnect}>
            Connect
          </Button>
        )}
      </div>

      {!isConnected ? (
        <div className="text-sm text-gray-500">
          <p>Connect your wallet to see information</p>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Network:</span>
            <span className="font-medium">{network || "mainnet-beta"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Address:</span>
            <span className="font-medium truncate max-w-[150px]">
              {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Balance:</span>
            <span className="font-medium">{balance?.toFixed(4) || "0"} SOL</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectWalletNode;
