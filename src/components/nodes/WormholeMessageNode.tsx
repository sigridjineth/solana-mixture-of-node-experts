'use client';

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@radix-ui/react-textarea";
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

export default function WormholeMessageNode({ id, data, isConnectable }: NodeProps) {
  const [sourceChain, setSourceChain] = useState("Solana");
  const [destinationChain, setDestinationChain] = useState("Ethereum");
  const [targetContract, setTargetContract] = useState("");
  const [payload, setPayload] = useState("");
  const [gasLimit, setGasLimit] = useState("500000");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageDetails, setMessageDetails] = useState<any>(null);

  const handleSendMessage = () => {
    // Open the modal instead of actually performing the operation
    setIsModalOpen(true);
    
    // For demonstration, we'll set some fake message details
    setMessageDetails({
      sourceChain,
      destinationChain,
      targetContract,
      payloadSize: payload.length,
      payloadHash: "0x" + Math.random().toString(16).substring(2, 34),
      gasLimit,
      estimatedFee: sourceChain === "Solana" ? "0.01 SOL" : "0.003 ETH",
      estimatedTime: "3-10 minutes",
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
            <CardTitle className="text-lg">Wormhole Messenger</CardTitle>
            <CardDescription>Send cross-chain messages</CardDescription>
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
          
          <div className="space-y-2">
            <Label>Target Contract Address</Label>
            <Input 
              value={targetContract}
              onChange={(e) => setTargetContract(e.target.value)}
              placeholder="Contract address on destination chain"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Message Payload (JSON)</Label>
            <textarea 
              className="w-full p-2 border rounded min-h-[80px]"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder='{"method": "example", "params": ["param1", "param2"]}'
            />
          </div>
          
          <div className="space-y-2">
            <Label>Gas Limit (optional)</Label>
            <Input 
              type="number" 
              value={gasLimit}
              onChange={(e) => setGasLimit(e.target.value)}
              placeholder="Gas limit for destination execution"
            />
          </div>
          
          {messageDetails && (
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <h4 className="font-medium">Message Details</h4>
              <div className="text-sm mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Payload Size:</span>
                  <span>{messageDetails.payloadSize} bytes</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Fee:</span>
                  <span>{messageDetails.estimatedFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time:</span>
                  <span>{messageDetails.estimatedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span>{messageDetails.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">Powered by Wormhole</p>
        <Button 
          onClick={handleSendMessage}
          disabled={isSubmitting || !targetContract || !payload}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Processing..." : "Send Message"}
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
        id="message-out"
        style={{ background: '#555', width: 10, height: 10 }}
        isConnectable={isConnectable}
      />
      
      {/* Feature coming soon modal */}
      {isModalOpen && (
        <ToBeContinuedModal 
          title="Wormhole Messenger"
          description="The Wormhole cross-chain messaging functionality will be supported in a future update."
          onClose={closeModal}
        />
      )}
    </Card>
  );
}