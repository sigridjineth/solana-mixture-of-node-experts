'use client';

import React from 'react';
import { FlowProvider } from '@/components/providers/FlowProvider';
import NodeDashboard from '@/components/dashboard/NodeDashboard';
import Controls from '@/components/dashboard/Controls';
import CustomContextMenu from '@/components/CustomContextMenu';
import { useAppKit } from '@reown/appkit/react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import SolanaProvider from '@/components/providers/SolanaProvider';

export default function Home() {
  const { open } = useAppKit();
  return (
    <main className="flex min-h-screen flex-col">
      <header className="relative overflow-hidden bg-gradient-to-r from-teal-300 via-sky-300 to-purple-300 text-gray-800 py-3 px-5 shadow-md">
        {/* 장식용 배경 패턴 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-white blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-purple-200 blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">Solana Dashboard</h1>
            <p className="text-xs text-gray-600">Visual async function workflow builder</p>
          </div>

          <div className="flex items-center space-x-3">
            <SolanaProvider>
              <button
                className="px-2 py-1 text-xs rounded-md bg-white/40 transition-colors shadow-sm"
                onClick={() => open()}
              >
                Connect Wallet
              </button>
            </SolanaProvider>

            <Dialog>
              <DialogTrigger asChild>
                <div className="h-6 w-6 rounded-full bg-white/40 flex items-center justify-center hover:bg-white/60 cursor-pointer transition-colors shadow-sm">
                  <span className="text-xs">?</span>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solana Node Dashboard</DialogTitle>
                  <DialogDescription className="py-4">
                    <p className="mb-4">
                      A visual node-based dashboard for building, analyzing, and visualizing Solana
                      blockchain transactions. This dashboard allows you to create workflows by
                      connecting various nodes to fetch, analyze, and visualize transaction data
                      from the Solana blockchain.
                    </p>
                    <p className="mb-4">
                      With this tool, you can easily analyze transactions, generate visualizations,
                      track account history, and gain insights into on-chain activities without
                      writing code.
                    </p>
                    <p className="text-sm text-muted-foreground mt-8">
                      Created by <span className="font-semibold">zombcat</span>
                    </p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <div className="flex flex-1 min-h-0 bg-background">
        <FlowProvider>
          <div className="flex-none w-56 p-4 border-r">
            <Controls />
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0">
              <NodeDashboard />
            </div>
          </div>
          <CustomContextMenu />
        </FlowProvider>
      </div>
    </main>
  );
}
