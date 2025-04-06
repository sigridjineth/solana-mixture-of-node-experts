'use client';

import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from 'lucide-react';
import ToBeContinuedModal from '@/components/ToBeContinuedModal';

type NodeProps = {
  id: string;
  data: any;
  isConnectable: boolean;
};

export default function CrosschainPrivacyNode({ id, data, isConnectable }: NodeProps) {
  const [privacyLevel, setPrivacyLevel] = useState("standard");
  const [mixingRounds, setMixingRounds] = useState(3);
  const [timeDelay, setTimeDelay] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [privacyDetails, setPrivacyDetails] = useState<any>(null);

  const handleProcess = () => {
    // Open the modal instead of actually performing the operation
    setIsModalOpen(true);
    
    // For demonstration, we'll set some fake privacy details
    setPrivacyDetails({
      originalTransactionId: Math.random().toString(36).substring(2, 15),
      shieldedTransactionId: "privacy-" + Math.random().toString(36).substring(2, 10),
      privacyScore: calculatePrivacyScore(),
      estimatedCompletionTime: timeDelay ? "15-30 minutes" : "1-5 minutes",
      status: "Simulated - Not Processed",
    });
  };

  const calculatePrivacyScore = () => {
    let baseScore = privacyLevel === "maximum" ? 95 : 
                   privacyLevel === "enhanced" ? 85 : 70;
    
    // Add points for extra mixing rounds
    baseScore += (mixingRounds - 3) * 2;
    
    // Add points for time delay
    if (timeDelay) baseScore += 3;
    
    // Cap at 99 and add some randomness
    return Math.min(99, baseScore + Math.floor(Math.random() * 2));
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Card className="w-[400px] shadow-md border-2 border-purple-500">
      <CardHeader className="bg-purple-50 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Privacy Shield</CardTitle>
            <CardDescription>Cross-chain Privacy Layer</CardDescription>
          </div>
          <Badge variant="outline" className="bg-purple-100">
            Cross-Chain
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Privacy Level</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-72 text-xs">
                      Standard: Basic transaction obfuscation<br />
                      Enhanced: Additional obfuscation + metadata stripping<br />
                      Maximum: Full zero-knowledge proofs + time delays
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <select 
              className="w-full p-2 border rounded"
              value={privacyLevel}
              onChange={(e) => setPrivacyLevel(e.target.value)}
            >
              <option value="standard">Standard</option>
              <option value="enhanced">Enhanced</option>
              <option value="maximum">Maximum</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Mixing Rounds</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60 text-xs">
                      More mixing rounds increases privacy but adds processing time and fees.
                      Default: 3 rounds.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max="5"
                value={mixingRounds}
                onChange={(e) => setMixingRounds(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="ml-2 text-sm font-medium">{mixingRounds}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Time Delay</label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-60 text-xs">
                      Adds random time delays to transactions for maximum privacy.
                      Can delay transactions by 15-30 minutes.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={timeDelay}
                onChange={(e) => setTimeDelay(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable random time delays</label>
            </div>
          </div>
          
          {privacyDetails && (
            <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
              <h4 className="font-medium">Privacy Details</h4>
              <div className="text-sm mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Privacy Score:</span>
                  <span className="font-semibold">{privacyDetails.privacyScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Time:</span>
                  <span>{privacyDetails.estimatedCompletionTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span>{privacyDetails.status}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 pt-1">
                  <span>Shielded Tx ID:</span>
                  <span>{privacyDetails.shieldedTransactionId}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">Cross-chain privacy layer</p>
        <Button 
          onClick={handleProcess}
          disabled={isProcessing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isProcessing ? "Processing..." : "Apply Privacy Shield"}
        </Button>
      </CardFooter>
      
      {/* Handles for ReactFlow */}
      <Handle
        type="target"
        position={Position.Left}
        id="transaction-in"
        style={{ background: '#9333ea', width: 10, height: 10 }}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="shielded-tx-out"
        style={{ background: '#9333ea', width: 10, height: 10 }}
        isConnectable={isConnectable}
      />
      
      {/* Feature coming soon modal */}
      {isModalOpen && (
        <ToBeContinuedModal 
          title="Privacy Shield"
          description="The cross-chain privacy features will be supported in a future update. This module will enable privacy-preserving transactions across multiple blockchains."
          onClose={closeModal}
        />
      )}
    </Card>
  );
}