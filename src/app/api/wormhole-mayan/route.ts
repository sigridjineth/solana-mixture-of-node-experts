import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
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

    const simulatedRoutes = [
      {
        provider: "Mayan SWIFT Route",
        sourceAmount: amount,
        expectedOutput: (parseFloat(amount) * 0.998).toFixed(6),
        fee: (parseFloat(amount) * 0.002).toFixed(6),
        estimatedTime: "2-5 minutes",
      },
      {
        provider: "Wormhole CCTPBridge Route",
        sourceAmount: amount,
        expectedOutput: (parseFloat(amount) * 0.997).toFixed(6),
        fee: (parseFloat(amount) * 0.003).toFixed(6),
        estimatedTime: "5-10 minutes",
      },
    ];

    const simulatedResponse = {
      success: true,
      transferDetails: {
        source: `${sourceToken} on ${sourceChain}`,
        destination: `${destinationToken} on ${destinationChain}`,
        amount,
        sender:
            senderWalletAddress ||
            "0x" + Math.random().toString(16).substring(2, 42),
        receiver: receiverAddress,
        status: "Simulated - Not Processed",
        routeDetails: {
          provider: "Mayan Finance SWIFT",
          expectedTime: "2-5 minutes",
          networkFee: `${(parseFloat(amount) * 0.0015).toFixed(6)}`,
          gasEstimate:
              sourceChain === "Solana" ? "0.000005 SOL" : "0.0003 ETH",
        },
        availableRoutes: simulatedRoutes,
        bestRoute: simulatedRoutes[0],
        transferId:
            "WH-MAYAN-" + Math.random().toString(16).substring(2, 10),
      },
      codeExample: `
import {
  Wormhole,
  routes,
} from "@wormhole-foundation/sdk-connect";
import { EvmPlatform } from "@wormhole-foundation/sdk-evm";
import { SolanaPlatform } from "@wormhole-foundation/sdk-solana";
import {
  MayanRouteSWIFT,
} from '@mayanfinance/wormhole-sdk-route';

const wh = new Wormhole("Mainnet", [EvmPlatform, SolanaPlatform]);
const sendChain = wh.getChain("${sourceChain}");
const destChain = wh.getChain("${destinationChain}");
const source = Wormhole.tokenId(sendChain.chain, "${sourceToken}");
const destination = Wormhole.tokenId(destChain.chain, "${destinationToken}");
const resolver = wh.resolver([MayanRouteSWIFT]);
const tr = await routes.RouteTransferRequest.create(wh, {
  source,
  destination,
});
const foundRoutes = await resolver.findRoutes(tr);
const bestRoute = foundRoutes[0];
const receipt = await bestRoute.initiate(
  tr,
  sender.signer,
  { amount: "${amount}" },
  "${receiverAddress}"
);
      `,
    };

    return NextResponse.json(simulatedResponse);
  } catch (error) {
    console.error("Wormhole Mayan API error:", error);
    return NextResponse.json(
        { error: `Error processing transfer request: ${(error as Error).message}` },
        { status: 500 }
    );
  }
}
