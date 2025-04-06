'use client';

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from '@radix-ui/react-label';
import ToBeContinuedModal from '@/components/ToBeContinuedModal';

type NodeProps = {
  id: string;
  data: any;
  isConnectable: boolean;
};

const chainOptions = [
  { id: 10002, name: "Ethereum Sepolia" },
  { id: 23, name: "Arbitrum" },
  { id: 4, name: "BSC" },
  { id: 22, name: "Avalanche" },
  { id: 5, name: "Polygon" },
  { id: 16, name: "Optimism" },
  { id: 1, name: "Solana" },
  { id: 21, name: "Sui" },
];

const commonFunctionSignatures = [
  "name()",
  "symbol()",
  "decimals()",
  "totalSupply()",
  "balanceOf(address)",
  "ownerOf(uint256)",
];

export default function WormholeQueryNode({ id, data, isConnectable }: NodeProps) {
  const [chainId, setChainId] = useState(10002);
  const [contractAddress, setContractAddress] = useState("");
  const [functionSignature, setFunctionSignature] = useState("name()");
  const [blockNumber, setBlockNumber] = useState("latest");
  const [apiKey, setApiKey] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queryResults, setQueryResults] = useState<any>(null);

  const handleQuery = () => {
    // Open the modal instead of actually performing the operation
    setIsModalOpen(true);
    
    // For demonstration, set some fake query results
    setQueryResults({
      chainId: chainId,
      blockNumber: blockNumber,
      contract: contractAddress,
      functionSignature: functionSignature,
      results: {
        raw: "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a5553444320546f6b656e000000000000000000000000000000000000000000",
        decoded: {
          type: "string",
          value: "USDC Token"
        }
      },
      status: "success"
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleCustomFunctionSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFunctionSignature(e.target.value);
  };

  const handleFunctionSignatureSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected !== "custom") {
      setFunctionSignature(selected);
    }
  };

  return (
    <Card className="w-[400px] shadow-md border-2 border-purple-500">
      <CardHeader className="bg-purple-50 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Wormhole Query</CardTitle>
            <CardDescription>Query cross-chain contract data</CardDescription>
          </div>
          <Badge variant="outline" className="bg-purple-100">
            Cross-Chain
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Chain</Label>
            <select 
              className="w-full p-2 border rounded"
              value={chainId}
              onChange={(e) => setChainId(parseInt(e.target.value))}
            >
              {chainOptions.map(chain => (
                <option key={chain.id} value={chain.id}>{chain.name} (ID: {chain.id})</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label>Contract Address</Label>
            <Input 
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Function Signature</Label>
            <div className="flex gap-2">
              <select 
                className="w-1/2 p-2 border rounded"
                onChange={handleFunctionSignatureSelect}
                value={commonFunctionSignatures.includes(functionSignature) ? functionSignature : "custom"}
              >
                {commonFunctionSignatures.map(sig => (
                  <option key={sig} value={sig}>{sig}</option>
                ))}
                <option value="custom">Custom...</option>
              </select>
              <Input 
                className="w-1/2"
                value={functionSignature}
                onChange={handleCustomFunctionSignature}
                placeholder="Custom function signature"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Block Number (optional)</Label>
            <Input 
              value={blockNumber}
              onChange={(e) => setBlockNumber(e.target.value)}
              placeholder="latest"
            />
          </div>
          
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input 
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your Wormhole Query API key"
            />
          </div>
          
          {queryResults && (
            <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
              <h4 className="font-medium">Query Results</h4>
              <div className="text-sm mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Contract:</span>
                  <span className="truncate max-w-[200px]">{queryResults.contract}</span>
                </div>
                <div className="flex justify-between">
                  <span>Function:</span>
                  <span>{queryResults.functionSignature}</span>
                </div>
                {queryResults.results.decoded && (
                  <div className="flex justify-between">
                    <span>Result:</span>
                    <span>{queryResults.results.decoded.value}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span>{queryResults.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">Powered by Wormhole Query API</p>
        <Button 
          onClick={handleQuery}
          disabled={isSubmitting || !contractAddress || !functionSignature || !apiKey}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isSubmitting ? "Querying..." : "Run Query"}
        </Button>
      </CardFooter>
      
      {/* Handles for ReactFlow */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ background: '#555', width: 10, height: 10 }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{ background: '#555', width: 10, height: 10 }}
        isConnectable={isConnectable}
      />
      
      {/* Feature coming soon modal */}
      {isModalOpen && (
        <ToBeContinuedModal 
          title="Wormhole Query API"
          description="The Wormhole cross-chain query functionality will be supported in a future update."
          onClose={closeModal}
        />
      )}
    </Card>
  );
}