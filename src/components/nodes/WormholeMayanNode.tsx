'use client';

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from '@radix-ui/react-label';
import {
  Wormhole,
  routes,
} from "@wormhole-foundation/sdk-connect";
import { EvmPlatform } from "@wormhole-foundation/sdk-evm";
import { SolanaPlatform } from "@wormhole-foundation/sdk-solana";
import {
  MayanRouteSWIFT,
} from '@mayanfinance/wormhole-sdk-route';

type NodeProps = {
  id: string;
  data: any;
  isConnectable: boolean;
};

const chainOptions = [
  "Base",
  "Ethereum",
  "Avalanche", 
  "Solana",
  "Sui",
  "Arbitrum",
  "Optimism",
  "Polygon",
  "BSC"
];

const tokenOptions = {
  "Base": ["native", "USDC", "DAI", "WBTC"],
  "Ethereum": ["native", "USDC", "USDT", "WBTC", "DAI"],
  "Avalanche": ["native", "USDC", "USDT", "BTC.b", "ETH.e"],
  "Solana": ["native", "USDC", "USDT", "BTC (Wrapped)", "ETH (Wrapped)"],
  "Sui": ["native", "USDC", "USDT", "WETH", "WBTC"],
  "Arbitrum": ["native", "USDC", "USDT", "ARB", "GMX"],
  "Optimism": ["native", "USDC", "USDT", "OP", "SNX"],
  "Polygon": ["native", "USDC", "USDT", "WETH", "WBTC"],
  "BSC": ["native", "BUSD", "USDT", "CAKE", "ETH (Wrapped)"]
};

export default function WormholeMayanNode({ id, data, isConnectable }: NodeProps) {
  const [sourceChain, setSourceChain] = useState("Base");
  const [destinationChain, setDestinationChain] = useState("Solana");
  const [sourceToken, setSourceToken] = useState("native");
  const [destinationToken, setDestinationToken] = useState("native");
  const [amount, setAmount] = useState("0.01");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [senderPrivateKey, setSenderPrivateKey] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferDetails, setTransferDetails] = useState<any>(null);
  const [codeView, setCodeView] = useState(false);

  const handleTransfer = () => {
    // Open the modal instead of actually performing the operation
    setIsModalOpen(true);
    
    // For demonstration, set some fake transfer details
    setTransferDetails({
      source: `${sourceToken} on ${sourceChain}`,
      destination: `${destinationToken} on ${destinationChain}`,
      amount: amount,
      receiver: receiverAddress,
      status: "Simulated - Not Processed",
      routeDetails: {
        provider: "Mayan Finance SWIFT",
        expectedTime: "2-5 minutes",
        networkFee: `${(parseFloat(amount) * 0.0015).toFixed(6)}`,
        gasEstimate: sourceChain === "Solana" ? "0.000005 SOL" : "0.0003 ETH",
      },
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleCodeView = () => {
    setCodeView(!codeView);
  };

  return (
    <Card className="w-[450px] shadow-md border-2 border-green-500">
      <CardHeader className="bg-green-50 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Wormhole + Mayan</CardTitle>
            <CardDescription>Cross-chain transfers with Mayan Finance SWIFT</CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-100">
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
                onChange={(e) => {
                  setSourceChain(e.target.value);
                  if (tokenOptions[e.target.value as keyof typeof tokenOptions]) {
                    setSourceToken(tokenOptions[e.target.value as keyof typeof tokenOptions][0]);
                  }
                }}
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
                onChange={(e) => {
                  setDestinationChain(e.target.value);
                  if (tokenOptions[e.target.value as keyof typeof tokenOptions]) {
                    setDestinationToken(tokenOptions[e.target.value as keyof typeof tokenOptions][0]);
                  }
                }}
              >
                {chainOptions.map(chain => (
                  <option key={chain} value={chain}>{chain}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source Token</Label>
              <select 
                className="w-full p-2 border rounded"
                value={sourceToken}
                onChange={(e) => setSourceToken(e.target.value)}
              >
                {tokenOptions[sourceChain as keyof typeof tokenOptions]?.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Destination Token</Label>
              <select 
                className="w-full p-2 border rounded"
                value={destinationToken}
                onChange={(e) => setDestinationToken(e.target.value)}
              >
                {tokenOptions[destinationChain as keyof typeof tokenOptions]?.map(token => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input 
              type="text" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount to transfer (e.g., 0.01)"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Receiver Address</Label>
            <Input 
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              placeholder="Address on destination chain"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Sender Private Key (Stored Securely)</Label>
            <Input 
              type="password"
              value={senderPrivateKey}
              onChange={(e) => setSenderPrivateKey(e.target.value)}
              placeholder="Private key for signing transaction"
            />
          </div>
          
          {transferDetails && (
            <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
              <h4 className="font-medium">Transfer Details</h4>
              <div className="text-sm mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Route Provider:</span>
                  <span>{transferDetails.routeDetails.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Fee:</span>
                  <span>{transferDetails.routeDetails.networkFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time:</span>
                  <span>{transferDetails.routeDetails.expectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span>{transferDetails.status}</span>
                </div>
              </div>
            </div>
          )}
          
          {codeView && (
            <div className="p-3 bg-gray-800 text-gray-200 rounded overflow-x-auto text-xs">
              <pre>{`
// Setup Wormhole client
const wh = new Wormhole("Mainnet", [EvmPlatform, SolanaPlatform]);

// Set up chains
const sendChain = wh.getChain("${sourceChain}");
const destChain = wh.getChain("${destinationChain}");

// Set up token IDs
const source = Wormhole.tokenId(sendChain.chain, "${sourceToken}");
const destination = Wormhole.tokenId(destChain.chain, "${destinationToken}");

// Create resolver with Mayan route
const resolver = wh.resolver([MayanRouteSWIFT]);

// Create transfer request
const tr = await routes.RouteTransferRequest.create(wh, {
  source,
  destination,
});

// Find optimal route
const foundRoutes = await resolver.findRoutes(tr);
const bestRoute = foundRoutes[0];

// Execute transfer
const receipt = await bestRoute.initiate(
  tr,
  sender.signer,
  { amount: "${amount}" },
  "${receiverAddress || "RECEIVER_ADDRESS"}"
);
              `}</pre>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <p className="text-xs text-gray-500">Powered by Wormhole + Mayan</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-6 text-xs"
            onClick={toggleCodeView}
          >
            {codeView ? "Hide Code" : "Show Code"}
          </Button>
        </div>
        <Button 
          onClick={handleTransfer}
          disabled={isSubmitting || !amount || !receiverAddress || !senderPrivateKey}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSubmitting ? "Processing..." : "Transfer Funds"}
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
        id="transfer-out"
        style={{ background: '#555', width: 10, height: 10 }}
        isConnectable={isConnectable}
      />
    </Card>
  );
}
