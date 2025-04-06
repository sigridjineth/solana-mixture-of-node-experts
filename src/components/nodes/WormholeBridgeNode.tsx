'use client';

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tooltip } from '@radix-ui/react-tooltip';
import { Label } from '@radix-ui/react-label';
import ToBeContinuedModal from '@/components/ToBeContinuedModal';

type NodeProps = {
  id: string;
  data: any;
  isConnectable: boolean;
};

const chainOptions = [
  "Solana",
  "Ethereum",
  "Avalanche", 
  "Sui",
  "Base",
  "Arbitrum",
  "Optimism",
  "Polygon",
  "BSC"
];

const tokenOptions = {
  "Solana": ["SOL", "USDC", "USDT", "BTC (Wrapped)", "ETH (Wrapped)"],
  "Ethereum": ["ETH", "USDC", "USDT", "WBTC", "DAI"],
  "Avalanche": ["AVAX", "USDC", "USDT", "BTC.b", "ETH.e"],
  "Sui": ["SUI", "USDC", "USDT", "WETH", "WBTC"],
  "Base": ["ETH", "USDC", "DAI", "WBTC"],
  "Arbitrum": ["ETH", "USDC", "USDT", "ARB", "GMX"],
  "Optimism": ["ETH", "USDC", "USDT", "OP", "SNX"],
  "Polygon": ["MATIC", "USDC", "USDT", "WETH", "WBTC"],
  "BSC": ["BNB", "BUSD", "USDT", "CAKE", "ETH (Wrapped)"]
};

export default function WormholeBridgeNode({ id, data, isConnectable }: NodeProps) {
  const [sourceChain, setSourceChain] = useState("Solana");
  const [destinationChain, setDestinationChain] = useState("Ethereum");
  const [token, setToken] = useState("USDC");
  const [amount, setAmount] = useState("1");
  const [recipient, setRecipient] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bridgeDetails, setBridgeDetails] = useState<any>(null);

  const handleBridge = () => {
    // Open the modal instead of actually performing the operation
    setIsModalOpen(true);
    
    // For demonstration, we'll set some fake bridge details
    setBridgeDetails({
      sourceChain,
      destinationChain,
      token,
      amount,
      estimatedFee: `${(parseFloat(amount) * 0.003).toFixed(6)} ${token}`,
      estimatedTime: sourceChain === "Solana" ? "2-5 minutes" : "10-15 minutes",
      status: "Simulated - Not Processed",
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Card className="w-[400px] shadow-md border-2 border-blue-500">
      <CardHeader className="bg-blue-50 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Wormhole Bridge</CardTitle>
            <CardDescription>Bridge assets between chains</CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-100">
            Cross-Chain
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source Chain</Label>
              <select 
                className="w-full p-2 border rounded"
                value={sourceChain}
                onChange={(e) => setSourceChain(e.target.value)}
              >
                {chainOptions.map(chain => (
                  <option key={chain} value={chain}>{chain}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Destination Chain</Label>
              <select 
                className="w-full p-2 border rounded"
                value={destinationChain}
                onChange={(e) => setDestinationChain(e.target.value)}
              >
                {chainOptions.map(chain => (
                  <option key={chain} value={chain}>{chain}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Token</Label>
              <select 
                className="w-full p-2 border rounded"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              >
                {tokenOptions[sourceChain as keyof typeof tokenOptions]?.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Amount</Label>
              <Input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to bridge"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Recipient Address</Label>
            <Input 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Address on destination chain"
            />
          </div>
          
          {bridgeDetails && (
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <h4 className="font-medium">Bridge Details</h4>
              <div className="text-sm mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Estimated Fee:</span>
                  <span>{bridgeDetails.estimatedFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time:</span>
                  <span>{bridgeDetails.estimatedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span>{bridgeDetails.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">Powered by Wormhole</p>
        <Button 
          onClick={handleBridge}
          disabled={isSubmitting || !amount || !recipient}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Processing..." : "Bridge Tokens"}
        </Button>
      </CardFooter>
      
      {/* Handles for ReactFlow */}
      <Handle
        type="target"
        position={Position.Left}
        id="wallet-in"
        style={{ background: '#555', width: 10, height: 10 }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="bridge-out"
        style={{ background: '#555', width: 10, height: 10 }}
        isConnectable={isConnectable}
      />
      
      {/* Feature coming soon modal */}
      {isModalOpen && (
        <ToBeContinuedModal 
          title="Wormhole Bridge"
          description="The Wormhole cross-chain bridge functionality will be supported in a future update."
          onClose={closeModal}
        />
      )}
    </Card>
  );
}