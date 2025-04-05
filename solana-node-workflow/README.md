# Solana Node Workflow

MCP server for executing Solana Node Dashboard workflows from the command line.

## Installation

```bash
npm install -g @anaisbetts/solana-node-workflow
```

## Usage

### Running a Workflow

You can run a workflow in two ways:

1. Using a workflow ID:
```bash
solana-node-workflow run -w <workflow-id>
```

2. Using a workflow JSON file:
```bash
solana-node-workflow run -w path/to/workflow.json
```

### Options

- `-w, --workflow <workflow>`: Workflow ID or JSON file path (required)
- `-e, --endpoint <endpoint>`: Custom API endpoint (default: https://solana-node-dashboard-v2.vercel.app)

### Example

```bash
# Run a workflow using its ID
solana-node-workflow run -w abc123

# Run a workflow from a JSON file
solana-node-workflow run -w ./my-workflow.json

# Run a workflow using a custom endpoint
solana-node-workflow run -w abc123 -e http://localhost:3000
```

## Development

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run in development mode:
```bash
npm run dev
```

## License

MIT 