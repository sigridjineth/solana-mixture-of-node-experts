import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recipient, amount, rpcUrl } = body;

    if (!recipient) {
      return NextResponse.json({ error: "Recipient address is required" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }

    // This is a server-side API route, so we can't directly use React hooks
    // Instead, we'll return a response that indicates the client should handle the transaction
    return NextResponse.json({
      signature: "dummy-signature-for-testing",
      message: "Transaction should be handled on the client side",
    });
  } catch (error) {
    console.error("Error in solana-send-transaction API:", error);
    return NextResponse.json(
      { error: `Failed to send transaction: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
