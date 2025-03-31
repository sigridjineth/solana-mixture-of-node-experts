import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { transactionData } = await request.json();

    if (!transactionData) {
      return NextResponse.json(
        { error: "트랜잭션 데이터가 필요합니다" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are a Solana transaction visualization expert.
      Please analyze the following Solana transaction and create a Mermaid sequence diagram.
      The diagram should show the interaction between accounts and programs in the transaction.
      
      Rules for the diagram:
      1. Start with "sequenceDiagram"
      2. Use participant for accounts and programs
      3. Show the flow of instructions with arrows
      4. Include brief descriptions of what each instruction does
      5. Keep it concise but informative
      6. Only output the Mermaid diagram code, nothing else
      
      Transaction data:
      ${JSON.stringify(transactionData, null, 2)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const mermaid = response.text();

    return NextResponse.json({ mermaid });
  } catch (error) {
    console.error("Mermaid 다이어그램 생성 중 오류 발생:", error);
    return NextResponse.json(
      { error: "Mermaid 다이어그램 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
