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
import { Send, Wallet, Link } from "lucide-react";
import { Handle, Position } from "reactflow";

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
  };
}

const SendTransactionNode: React.FC<SendTransactionNodeProps> = ({ data }) => {
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

  useEffect(() => {
    // Check if we have a connected sender from the ConnectWalletNode
    if (data.connectedInputs?.sender) {
      const walletInfo = data.connectedInputs.sender;
      if (walletInfo && walletInfo.address) {
        setSenderAddress(walletInfo.address);
        setIsConnected(true);
      }
    } else if (address && walletProvider?.publicKey) {
      // Fallback to the current wallet if no connected sender
      setSenderAddress(address);
      setIsConnected(true);
    } else {
      setIsConnected(false);
      setSenderAddress(null);
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
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <h3 className="font-medium text-sm">Send Transaction</h3>
        </div>
        {!isConnected && (
          <Button variant="outline" size="sm" onClick={handleConnect}>
            Connect Wallet
          </Button>
        )}
      </div>

      {!isConnected ? (
        <div className="text-sm text-gray-500">
          <p>Connect your wallet to send transactions</p>
          <p className="mt-2 text-xs text-blue-500 flex items-center">
            <Wallet className="h-3 w-3 mr-1" />
            Connect this node to other nodes that need transaction data
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="text-xs font-medium">Sender Address</div>
            <div className="text-sm bg-gray-50 p-2 rounded">
              {senderAddress
                ? `${senderAddress.slice(0, 4)}...${senderAddress.slice(-4)}`
                : "Not connected"}
            </div>
            <p className="text-xs text-blue-500 flex items-center">
              <Link className="h-3 w-3 mr-1" />
              Connect a wallet node to the sender input
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium">Recipient Address</div>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient address"
            />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium">Amount (SOL)</div>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in SOL"
              min="0"
              step="0.000000001"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            onClick={handleSendTransaction}
            disabled={isLoading || !recipient || !amount || parseFloat(amount) <= 0}
            className="w-full"
          >
            {isLoading ? "Sending..." : "Send Transaction"}
          </Button>
          {transactionResult && (
            <div className="mt-2 p-2 bg-green-50 rounded text-sm">
              <p className="text-green-700">Transaction sent successfully!</p>
              <p className="text-xs text-gray-500 truncate">
                Signature: {transactionResult.signature}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add input handle for sender */}
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
          top: "30%",
          transform: "translateY(-50%)",
          position: "absolute",
        }}
      />

      {/* Add output handle for transaction info */}
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
  );
};

export default SendTransactionNode;
