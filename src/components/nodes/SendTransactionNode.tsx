import React, { useState, useEffect } from "react";
import { useAppKitAccount, useAppKitProvider, useAppKit } from "@reown/appkit/react";
import { useAppKitConnection, type Provider } from "@reown/appkit-adapter-solana/react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Wallet, Link, Play, Loader2 } from "lucide-react";
import { Handle, Position } from "reactflow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNodeData } from "@/lib/utils";

interface SendTransactionNodeProps {
  data: {
    returnValue?: {
      success: boolean;
      signature: string | null;
      message: string;
      transaction: any | null;
    };
    connectedInputs?: {
      sender?: any;
    };
    isProcessing?: boolean;
    hasError?: boolean;
    label?: string;
  };
  id?: string;
  selected?: boolean;
}

const SendTransactionNode: React.FC<SendTransactionNodeProps> = ({ data, id, selected }) => {
  const { address } = useAppKitAccount();
  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { open } = useAppKit();

  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [senderAddress, setSenderAddress] = useState<string | null>(null);
  const [walletInfo, setWalletInfo] = useState<any>(null);

  useEffect(() => {
    // Check if we have a connected sender from the ConnectWalletNode
    if (data.connectedInputs?.sender) {
      const connectedWalletInfo = data.connectedInputs.sender;
      setWalletInfo(connectedWalletInfo);
      if (connectedWalletInfo && connectedWalletInfo.address) {
        setSenderAddress(connectedWalletInfo.address);
        setIsConnected(true);
      }
    } else if (address && walletProvider?.publicKey) {
      // Fallback to the current wallet if no connected sender
      setSenderAddress(address);
      setIsConnected(true);
    } else {
      setIsConnected(false);
      setSenderAddress(null);
      setWalletInfo(null);
    }
  }, [address, walletProvider?.publicKey, data.connectedInputs?.sender]);

  const handleConnect = async () => {
    try {
      open();
      if (walletProvider) {
        await walletProvider.connect();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setError("Failed to connect wallet");
    }
  };

  const handleSendTransaction = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!recipient) {
      setError("Recipient address is required");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create connection to Solana network
      const solanaConnection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com"
      );

      // Create the transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: walletProvider!.publicKey!,
          toPubkey: new PublicKey(recipient),
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );

      // Get the latest blockhash
      const { blockhash } = await solanaConnection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = walletProvider!.publicKey!;

      // Sign the transaction with the wallet
      const signedTransaction = await walletProvider!.signTransaction(transaction);

      // Send the transaction
      const signature = await solanaConnection.sendRawTransaction(signedTransaction.serialize());

      // Wait for confirmation
      const confirmation = await solanaConnection.confirmTransaction(signature);

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      // Get transaction details
      const txDetails = await solanaConnection.getTransaction(signature);

      // Create a transaction object that can be used by other nodes
      const transactionInfo = {
        signature,
        blockTime: Math.floor(Date.now() / 1000),
        slot: txDetails?.slot || 0,
        type: "SOL Transfer",
        err: null,
        transaction: {
          message: {
            accountKeys: [walletProvider!.publicKey!.toString(), recipient],
            instructions: [
              {
                programId: "11111111111111111111111111111111", // System program ID
                accounts: [walletProvider!.publicKey!.toString(), recipient],
                data: `Transfer ${amount} SOL`,
              },
            ],
          },
          signatures: [signature],
        },
        meta: {
          fee: txDetails?.meta?.fee || 5000,
          postBalances: txDetails?.meta?.postBalances || [0, 0],
          preBalances: txDetails?.meta?.preBalances || [0, 0],
        },
      };

      const result = {
        success: true,
        signature,
        message: "Transaction sent and confirmed successfully",
        transaction: transactionInfo,
      };

      setTransactionResult(result);

      // Update data.returnValue to make it available for connections
      if (data && typeof data === "object") {
        data.returnValue = result;
      }
    } catch (error: any) {
      console.error("Error sending transaction:", error);
      setError(`Error sending transaction: ${error.message}`);

      // Update data.returnValue with error
      if (data && typeof data === "object") {
        data.returnValue = {
          success: false,
          signature: null,
          message: `Error sending transaction: ${error.message}`,
          transaction: null,
        };
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={`shadow-md relative ${selected ? "ring-2 ring-primary" : ""} ${
        data.hasError ? "border-red-500" : ""
      }`}
      style={{ width: "280px" }}
      data-node-id={id}
    >
      <CardHeader className="p-3 pb-2 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-sm font-medium">{data.label || "Send Transaction"}</CardTitle>
          <Badge variant="outline" className="mt-1 text-xs">
            Solana
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleSendTransaction}
          disabled={isLoading || !isConnected || !recipient || !amount || parseFloat(amount) <= 0}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        </Button>
      </CardHeader>

      <CardContent className="p-3 pt-0">
        <div className="mb-4">
          <div className="text-xs font-semibold mb-2">Inputs</div>

          {/* Sender Input */}
          <div className="mb-3 relative">
            <div className="text-xs text-muted-foreground mb-1 flex items-center relative">
              <Handle
                type="target"
                position={Position.Left}
                id="input-sender"
                className="rounded-full bg-primary border-2 border-background handle-visible"
                style={{
                  width: "12px",
                  height: "12px",
                  minWidth: "12px",
                  minHeight: "12px",
                  left: "-6px",
                  zIndex: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  position: "absolute",
                }}
              />
              <span className="bg-primary/10 rounded-sm px-1 py-0.5 ml-3 mr-1">sender</span>
              <span className="text-red-500">*</span>
            </div>
            <div className="text-sm bg-gray-50 p-2 rounded">
              {senderAddress
                ? `${senderAddress.slice(0, 4)}...${senderAddress.slice(-4)}`
                : "Not connected"}
            </div>
            {!isConnected && (
              <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleConnect}>
                Connect Wallet
              </Button>
            )}
          </div>

          {/* Recipient Input */}
          <div className="mb-3 relative">
            <div className="text-xs text-muted-foreground mb-1 flex items-center relative">
              <span className="bg-primary/10 rounded-sm px-1 py-0.5 ml-3 mr-1">recipient</span>
              <span className="text-red-500">*</span>
            </div>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient address"
            />
          </div>

          {/* Amount Input */}
          <div className="mb-3 relative">
            <div className="text-xs text-muted-foreground mb-1 flex items-center relative">
              <span className="bg-primary/10 rounded-sm px-1 py-0.5 ml-3 mr-1">amount</span>
              <span className="text-red-500">*</span>
            </div>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in SOL"
              min="0"
              step="0.000000001"
            />
          </div>
        </div>

        {/* Connected Values */}
        {walletInfo && (
          <div className="mt-3 mb-2">
            <div className="text-xs font-semibold mb-2">Connected Values</div>
            <div className="mb-2">
              <div className="text-xs text-muted-foreground mb-1 flex items-center">
                <span className="bg-primary/10 rounded-sm px-1 py-0.5 ml-3 mr-1">sender</span>
              </div>
              <div
                className="bg-muted p-2 rounded-md text-xs font-mono custom-scrollbar"
                style={{
                  overflowY: "auto",
                  maxHeight: "60px",
                  overflowX: "hidden",
                }}
              >
                {formatNodeData(walletInfo)}
              </div>
            </div>
          </div>
        )}

        {/* Output */}
        <div className="mt-4">
          <div className="text-xs font-semibold mb-2">Output</div>
          <div className="flex items-center justify-end relative h-8">
            <div className="text-xs text-muted-foreground relative flex items-center">
              <span className="bg-primary/10 rounded-sm px-1 py-0.5 mr-6">transactionInfo</span>
              <Handle
                type="source"
                position={Position.Right}
                id="transactionInfo"
                className="rounded-full bg-primary border-2 border-background handle-visible"
                style={{
                  width: "12px",
                  height: "12px",
                  minWidth: "12px",
                  minHeight: "12px",
                  right: "-6px",
                  zIndex: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  position: "absolute",
                }}
              />
            </div>
          </div>
        </div>

        {/* Return Value */}
        {data.returnValue !== undefined && (
          <div className="mt-3">
            <div className="text-xs font-semibold mb-1">Return Value</div>
            <div
              className="bg-muted p-2 rounded-md text-xs font-mono custom-scrollbar"
              style={{
                overflowY: "auto",
                maxHeight: "240px",
                overflowX: "hidden",
              }}
            >
              {formatNodeData(data.returnValue)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SendTransactionNode;
