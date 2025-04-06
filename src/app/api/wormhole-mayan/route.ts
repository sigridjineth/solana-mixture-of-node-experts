import { NextResponse, type NextRequest } from "next/server";
import { ethers } from "ethers";
import {
  Wormhole,
  routes,
} from "@wormhole-foundation/sdk-connect";
import { EvmPlatform } from "@wormhole-foundation/sdk-evm";
import { SolanaPlatform } from "@wormhole-foundation/sdk-solana";
import { MayanRouteSWIFT } from "@mayanfinance/wormhole-sdk-route";

const RPC_URL = process.env.SOURCE_CHAIN_RPC_URL || "";
const PRIVATE_KEY = process.env.SOURCE_CHAIN_PRIVATE_KEY || "";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();
    const {
      sourceChain,
      destinationChain,
      sourceToken,
      destinationToken,
      amount,
      receiverAddress,
      senderWalletAddress,
    } = body;

    if (
        !sourceChain ||
        !destinationChain ||
        !sourceToken ||
        !destinationToken ||
        !amount ||
        !receiverAddress
    ) {
      return NextResponse.json(
          { error: "Missing required parameters" },
          { status: 400 }
      );
    }

    const wh = new Wormhole("Mainnet", [EvmPlatform, SolanaPlatform]);

    const sendChain = wh.getChain(sourceChain);
    const destChain = wh.getChain(destinationChain);
    const source = Wormhole.tokenId(sendChain.chain, sourceToken);
    const destination = Wormhole.tokenId(destChain.chain, destinationToken);
    const resolver = wh.resolver([MayanRouteSWIFT]);
    const transferRequest = await routes.RouteTransferRequest.create(wh, {
      source,
      destination,
    });

    const foundRoutes = await resolver.findRoutes(transferRequest);

    if (!foundRoutes.length) {
      return NextResponse.json(
          { error: "No bridging routes found for specified parameters" },
          { status: 500 }
      );
    }
    const bestRoute = foundRoutes[0];

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const txReceipt = await bestRoute.initiate(
        transferRequest,
        wallet, // or appropriate signer
        { amount: String(amount) }, // must be string or BN
        receiverAddress
    );

    // 11. Build a response describing the result
    // You might return the transaction hash, bridging status, or any other details
    const responsePayload = {
      success: true,
      message: "Transfer initiated successfully",
      bridgingRoute: bestRoute.name,
      transactionHash: txReceipt.transactionHash || txReceipt,
      details: {
        sourceChain,
        destinationChain,
        sourceToken,
        destinationToken,
        amount,
        receiverAddress,
        senderWalletAddress: senderWalletAddress || wallet.address,
      },
    };

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Wormhole bridging error:", error);
    return NextResponse.json(
        { error: `Error processing transfer request: ${String(error)}` },
        { status: 500 }
    );
  }
}
