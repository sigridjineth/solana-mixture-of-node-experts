# MoNE: Mixture of Node-based Experts

A **no-code builder** for AI Agent workflows on Solana. Connect specialized modules (DeFi, bridging, staking) with fine-tuned LLMs, leverage zero-knowledge proofs for transparent execution, and harness JitoSOL or Wormhole for cross-chain automation—all via drag-and-drop.

![Main Link](https://solana-node-dashboard-v2.vercel.app/)  
![Solana Dashboard](docs/dashboard-preview.png)  
![Pitch Deck](https://drive.google.com/file/d/17Lbo5V3lurJbA2LKJ2LA7xpS8zDPmkyJ/view?usp=sharing)

---

## Overview

MoNE transforms the original “Solana Node Dashboard” into a **powerful AI-driven automation platform** for Solana. Instead of just fetching and visualizing transaction data, you can now orchestrate entire AI Agent workflows—analyzing on-chain events, making informed decisions with fine-tuned LLMs, and executing DeFi or bridging operations in a single, visual interface.

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

---

## Credits

MoNE is built upon the original Solana Node Dashboard by [zombcat](https://github.com/zombcat). Our team at Wanot AI expanded it into a **no-code AI Agent Builder** by adding specialized nodes for DeFi, bridging, LLM inference, and zero-knowledge proof generation. We believe this blend of AI insights, Solana’s speed, and a visual node-based approach sets the stage for the next wave of on-chain automation.
