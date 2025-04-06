import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import ToBeContinuedModal from "@/components/ToBeContinuedModal";

const liquiditySources = [
  { name: "Orca", chain: "Solana Mainnet", icon: "/solana-orca.webp" },
  { name: "Raydium", chain: "Solana Mainnet", icon: "/solana-raydium.webp" },
  { name: "Jupiter", chain: "Solana Mainnet", icon: "/solana-jupyter.webp" },
  { name: "Meteora", chain: "Solana Mainnet", icon: "/solana-jupyter.webp" },
  { name: "Mayan", chain: "Multichain", icon: "/huggingface-color.webp" },
  { name: "SVM Liquidity", chain: "SVM", icon: "/huggingface-color.webp" },
  { name: "Fida", chain: "Solana Mainnet", icon: "/solana-jupyter.webp" },
];

const CrosschainLiquidityNode = ({ data, id }: any) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [aggregationStrategy, setAggregationStrategy] = useState("optimal");
  const [slippageTolerance, setSlippageTolerance] = useState("0.5");

  const toggleSource = (name: string) => {
    if (selectedSources.includes(name)) {
      setSelectedSources(selectedSources.filter((s) => s !== name));
    } else {
      setSelectedSources([...selectedSources, name]);
    }
  };

  const handleExecute = () => {
    setShowModal(true);
  };

  return (
    <div className="bg-white rounded-md border border-gray-300 shadow-md w-[380px]">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-t-md">
        <div className="flex items-center gap-2">
          <img src="/mcp.png" alt="Icon" className="w-6 h-6" />
          <h3 className="text-white font-medium">Cross-Chain Liquidity Aggregator</h3>
        </div>
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-600 mb-4">
          Aggregate liquidity across multiple protocols and Solana chains to access the best rates.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Liquidity Sources</label>
          <div className="grid grid-cols-2 gap-2">
            {liquiditySources.map((source) => (
              <div
                key={source.name}
                className={`border rounded-md p-2 cursor-pointer flex items-center ${
                  selectedSources.includes(source.name)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() => toggleSource(source.name)}
              >
                <img src={source.icon} alt={source.name} className="w-5 h-5 mr-2" />
                <div>
                  <div className="text-sm font-medium">{source.name}</div>
                  <div className="text-xs text-gray-500">{source.chain}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Aggregation Strategy</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            value={aggregationStrategy}
            onChange={(e) => setAggregationStrategy(e.target.value)}
          >
            <option value="optimal">Optimal (Best Price)</option>
            <option value="fastest">Fastest Execution</option>
            <option value="lowest-impact">Lowest Market Impact</option>
            <option value="multi-route">Multi-Route Split</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Slippage Tolerance (%)</label>
          <Input
            type="number"
            min="0.1"
            max="5"
            step="0.1"
            value={slippageTolerance}
            onChange={(e) => setSlippageTolerance(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Advanced Settings</label>
          <Card className="p-3">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Include SVM Chains</span>
              <input type="checkbox" checked={selectedSources.includes("SVM Liquidity")} onChange={() => toggleSource("SVM Liquidity")} />
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Cross-chain Routing</span>
              <input type="checkbox" checked={selectedSources.includes("Mayan")} onChange={() => toggleSource("Mayan")} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Partial Fill Protection</span>
              <input type="checkbox" defaultChecked />
            </div>
          </Card>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            className="w-full"
            onClick={handleExecute}
          >
            Execute Aggregation
          </Button>
        </div>

        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-1">Selected Sources ({selectedSources.length})</div>
          <div className="flex flex-wrap gap-1">
            {selectedSources.map((source) => (
              <Badge key={source} variant="outline" className="text-xs">
                {source}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Top} id="input" />
      <Handle type="source" position={Position.Bottom} id="output" />

      {showModal && (
        <ToBeContinuedModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Cross-Chain Liquidity Aggregator"
          description="This cross-chain liquidity aggregator feature will be fully implemented in a future update. Stay tuned for comprehensive multi-chain routing capabilities!"
          details={{
            selectedSources,
            aggregationStrategy,
            slippageTolerance,
            estimatedSavings: "0.3-1.2%",
            chainSupport: "Solana, Solana SVM, and connected chains via Wormhole",
          }}
        />
      )}
    </div>
  );
};

export default CrosschainLiquidityNode;