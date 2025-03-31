"use client";

import React from "react";
import { FlowProvider } from "@/components/providers/FlowProvider";
import NodeDashboard from "@/components/dashboard/NodeDashboard";
import Controls from "@/components/dashboard/Controls";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <h1 className="text-xl font-bold">Solana Dashboard</h1>
        <p className="text-sm opacity-80">
          Visual async function workflow builder
        </p>
      </header>
      <div className="flex flex-1 min-h-0 bg-background">
        <FlowProvider>
          <div className="flex-none w-80 p-4 border-r">
            <Controls />
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0">
              <NodeDashboard />
            </div>
          </div>
        </FlowProvider>
      </div>
    </main>
  );
}
