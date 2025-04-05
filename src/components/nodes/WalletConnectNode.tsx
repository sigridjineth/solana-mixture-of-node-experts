import React, { useEffect, useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useAppKitConnection, type Provider } from "@reown/appkit-adapter-solana/react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface WalletConnectNodeProps {
  data: any;
  isConnectable: boolean;
}

const WalletConnectNode: React.FC<WalletConnectNodeProps> = ({ data, isConnectable }) => {
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
        const networkInfo = await connection.getVersion();
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
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5" />
              <h3 className="text-sm font-medium">Solana Wallet</h3>
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

          {isConnected && address ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address:</span>
                <span className="font-mono truncate max-w-[200px]">{address}</span>
              </div>
              {balance !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Balance:</span>
                  <span>{balance.toFixed(4)} SOL</span>
                </div>
              )}
              {network && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span>{network}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-2">
              Connect your wallet to view information
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnectNode;
