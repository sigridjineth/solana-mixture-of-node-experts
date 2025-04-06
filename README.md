# Solana MoNE: Mixture of Node-based Experts

![Solana Dashboard](docs/dashboard-preview.png)

A **no-code builder** for AI Agent workflows on Solana. Connect specialized modules (DeFi, bridging, staking) with fine-tuned LLMs, leverage zero-knowledge proofs for transparent execution, and harness JitoSOL or Wormhole for cross-chain automation—all via drag-and-drop.

### Links
[Main Link](https://solana-node-dashboard-v2.vercel.app/)
[Pitch Deck](https://drive.google.com/file/d/17Lbo5V3lurJbA2LKJ2LA7xpS8zDPmkyJ/view?usp=sharing)

---

## Overview

MoNE is a **Comfy-UI styled powerful AI Agent-driven automation platform** for Solana. Instead of just fetching and visualizing transaction data, you can now orchestrate entire AI Agent workflows—analyzing on-chain events, making informed decisions with fine-tuned LLMs, and executing DeFi or bridging operations in a single, visual interface.

### Key Highlights

- **Visual Workflow Builder**  
  Drag and drop nodes to create multi-step on-chain automations.  
- **AI-Driven Decision Making**  
  Integrate fine-tuned LLMs to parse Solana transactions, detect arbitrage, route bridging, and more.  
- **Zero-Knowledge Proofs**  
  Generate verifiable proofs (via Arcium 2.0) for each AI operation, ensuring a transparent and auditable process.  
- **DeFi, Bridging, Staking**  
  Instantly connect to JitoSOL for staking or Wormhole for cross-chain transfers—no coding required.  
- **Fine-Tuned Models**  
  Includes a ModernBERT-based classifier, trained on ~1K Solana transaction samples across DeFi and NFT scenarios, to minimize hallucinations.

---

## Features

- **Transaction & DeFi Automation**  
  Combine specialized nodes for Solana DeFi (Raydium, Jupiter) and bridging (Wormhole).  
- **Mermaid Diagram Generation**  
  Convert raw transaction data into Mermaid diagrams for easy visualization.  
- **AI Insights**  
  Leverage chain-aware LLM nodes to interpret real-time transaction data, spot patterns, and trigger on-chain actions.  
- **No Code Approach**  
  Even non-developers can automate staking strategies with JitoSOL or cross-chain bridging via Wormhole, thanks to node-based assembly.  

---

## Example Use Cases

1. **DeFi Rebalancing**  
   - AI node checks the APR on multiple liquidity pools, decides if it’s profitable to stake or unstake from JitoSOL, and executes a transaction.  
2. **Cross-Chain Arbitrage**  
   - The system detects a price discrepancy between Solana and Ethereum, bridges tokens via a Wormhole node, and executes a swap automatically.  
3. **Smart Transaction Parsing**  
   - A specialized node converts raw transaction data to a Mermaid diagram, then an LLM interprets each instruction, offering a user-friendly summary.

---

## Nodes and Categories

### Solana Nodes
- **SolTx Fetch**: Retrieve Solana transaction data.  
- **SolTx History**: Get transaction history for an account or program.  
- **Solana Tx to Mermaid**: Convert transactions into Mermaid diagrams.

### AI Nodes
- **LLM Expert**: Integrate a fine-tuned language model to interpret transaction data or handle user prompts.  
- **Arcium Proof**: Generate a zero-knowledge proof for each AI-driven operation.

### DeFi & Bridging Nodes
- **JitoSOL Staking**: Automate staking or unstaking with JitoSOL.  
- **Wormhole Bridge**: Transfer assets cross-chain upon AI decision-making.  
- **Raydium/Jupiter Swap**: Execute token swaps after the AI identifies an opportunity.

### Utility Nodes
- **Fetch Data**: Retrieve off-chain or aggregator info.  
- **Filter / Sort / Map**: Restructure data arrays before sending them to AI nodes.  
- **Delay**: Pause execution.  
- **Discord Webhook**: Send alerts or results to a Discord channel.

---

## How It Works

1. **Add Nodes**: Select from specialized Solana, AI, or DeFi nodes in the UI.  
2. **Connect Them**: Draw lines between outputs and inputs to define your workflow.  
3. **Configure Parameters**: Adjust AI prompts or bridging details.  
4. **Run Workflow**: The system fetches on-chain data, leverages fine-tuned LLMs, and executes transactions (e.g., bridging via Wormhole).  
5. **Review Proof**: Generate and download a zero-knowledge proof verifying each step of the automation.

---

## Technical Architecture

- **Front End**: Built with React for UI and React Flow for node-based visualization.  
- **Back End**: Uses Node.js for orchestrating the workflow logic, bridging to Solana’s RPC or other protocols (Wormhole, JitoSOL).  
- **TypeScript & Tailwind CSS**: Ensures robust coding practices and consistent styling.  
- **Arcium 2.0**: Provides zero-knowledge proofs of AI computations and on-chain execution.  
- **Fine-Tuned Models**: We trained a chain routing classifier on approximately 1,000 real Solana transaction samples—covering NFTs, DeFi, bridging, and more—in a 1-epoch fine-tuning process.


---

## Track-Specific Integrations

### [⛓️ Multichain Track]
**Features Built**  
We developed a Wormhole-based bridging node in our no-code AI workflow, letting users automate cross-chain actions between Solana and other blockchains. An AI agent can detect an event on Solana (for instance, a price movement) and automatically route an asset to another chain (such as Ethereum) via Wormhole. Our node-based system uses the Wormhole SDK from the Solana Agent Kit, so users never have to write bridging contracts manually. With our fine-tuned chain routing classifier, the agent identifies the optimal path for bridging, guaranteeing a true multichain experience.


### [🪡 NCN Track]
**Features Built**  
For the NCN Track, we integrated JitoSOL directly into our no-code system. This setup lets AI agents manage node consensus utilities (NCNs) by reading from and writing to JitoSOL staking. An agent can watch staking yields in real time and, if yields surpass a certain threshold, command the Agent Kit to move user assets into JitoSOL automatically. We also allow teams to enforce advanced role-based authority at the AI logic layer without low-level coding.

### [☁ Liquid Staking Innovation Track]
**Features Built**  
We integrated Sanctum’s liquid staking module, enabling automated yield-maximizing workflows. Our AI agents can track APR data from Sanctum’s LST infrastructure, decide when to deposit or withdraw positions, and even handle partial staking through Sanctum’s “Infinity (INF)” feature. An agent might rebalance between a Sanctum LST and another DeFi protocol if it calculates a more favorable yield ratio.


### [₿ Bitcoin on Solana Track]
**Features Built**  
For Bitcoin on Solana, we utilized Zeus Network’s APOLLO gateway to support zBTC operations. We introduced a specialized “zBTC node” so an AI agent can lock BTC via APOLLO, mint zBTC on Solana, and proceed with additional DeFi or staking actions seamlessly. Our chain routing classifier differentiates standard SPL tokens from zBTC, ensuring correct bridging logic and transaction flows.

### [🌐 Solana Finfra Challenge Track]
**Features Built**  
We addressed advanced financial infrastructure scenarios across mainnet, sub-chains, and side-chains. We introduced a “Cross-Liquidity Aggregation” node that references multiple liquidity sources (including SVM side-chains) and a “Credit Analysis” node that reads on-chain collateral and borrowing data. Our AI engine then chooses the best liquidity pool or side-chain for safer yields or borrowing, ideal for institutional-scale workflows.

By tailoring each track-specific integration—Wormhole bridging for Multichain, JitoSOL for NCN, Sanctum LST for Liquid Staking, zBTC for Bitcoin on Solana, and sub-chain scanning for Finfra—we show how our agent builder can flexibly support a broad range of Solana functionalities. In every case, we refined our chain routing classifier and node logic to ensure a smooth, no-code development experience.


---

## Local Development

```bash
# Clone the repository
git clone https://github.com/zombcat/node-dashboard.git
cd node-dashboard

# Install dependencies
npm install
# or
yarn install

# Start the development server
npm run dev
# or
yarn dev
```

Your application should be available at http://localhost:3000

---

## Deployment

```bash
npm run build
# or
yarn build
```

After building, you can deploy the generated output to any static hosting platform or container environment.
