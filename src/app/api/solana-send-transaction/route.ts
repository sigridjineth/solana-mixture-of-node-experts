import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { recipient, amount, senderAddress } = await request.json();

    if (!recipient) {
      return NextResponse.json({ error: "Recipient address is required" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    // For now, return a dummy transaction signature
    // In a real implementation, you would create and send the transaction here
    return NextResponse.json({
      signature: "dummy_signature_for_testing",
      message: "Transaction should be handled on the client side",
      senderAddress: senderAddress || "unknown",
      recipient,
      amount,
      network: "mainnet-beta", // This should be determined based on the actual network
    });
  } catch (error: any) {
    console.error("Error in solana-send-transaction:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
