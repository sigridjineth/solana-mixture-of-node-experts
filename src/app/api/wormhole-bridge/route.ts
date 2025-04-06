import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      sourceChain, 
      destinationChain, 
      token, 
      amount, 
      recipientAddress,
      walletAddress 
    } = body;

    if (!sourceChain || !destinationChain || !token || !amount || !recipientAddress) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const bridgeDetails = {
      sourceChain,
      destinationChain,
      token,
      amount,
      sender: walletAddress || "Unknown",
      recipient: recipientAddress,
      estimatedFee: `${(parseFloat(amount) * 0.003).toFixed(6)} ${token}`,
      estimatedTime: sourceChain === "Solana" ? "2-5 minutes" : "10-15 minutes",
      status: "Processing",
      guardian: "Pyth Oracle Network",
      targetAddress: recipientAddress,
      transferId: "WH-" + Math.random().toString(36).substring(2, 15),
      attestationProgress: "Pending",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      bridgeDetails
    });
  } catch (error) {
    console.error("Wormhole bridge API error:", error);
    return NextResponse.json(
      { error: `Error processing bridge request: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
