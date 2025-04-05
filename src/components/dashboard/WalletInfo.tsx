"use client";

import React, { useEffect, useState } from "react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useAppKitConnection, type Provider } from "@reown/appkit-adapter-solana/react";
import { Card, CardContent } from "@/components/ui/card";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface WalletInfoProps {
  className?: string;
}

const WalletInfo: React.FC<WalletInfoProps> = ({ className }) => {
  const { address } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const [balance, setBalance] = useState<number | null>(null);
  const [network, setNetwork] = useState<string>("");

  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (!address || !connection || !walletProvider?.publicKey) return;

      try {
        // Get SOL balance
        const balanceInLamports = await connection.getBalance(walletProvider.publicKey);
        const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
        setBalance(balanceInSOL);

        // Get network
        const networkInfo = await connection.getVersion();
        setNetwork(networkInfo["solana-core"] || "unknown");
      } catch (error) {
        console.error("Error fetching wallet info:", error);
      }
    };

    fetchWalletInfo();
  }, [address, connection, walletProvider?.publicKey]);

  if (!address) {
    return null;
  }

  return (
    <Card className={`mt-4 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Address:</span>
            <span className="text-sm font-mono truncate max-w-[200px]">{address}</span>
          </div>
          {balance !== null && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Balance:</span>
              <span className="text-sm">{balance.toFixed(4)} SOL</span>
            </div>
          )}
          {network && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Network:</span>
              <span className="text-sm">{network}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletInfo;
