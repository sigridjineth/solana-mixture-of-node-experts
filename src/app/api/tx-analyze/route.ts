import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { transactionData, prompt } = await request.json();

    if (!transactionData) {
      return NextResponse.json(
        { error: "트랜잭션 데이터가 필요합니다" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 트랜잭션 기본 정보 분석
    const analysis = {
      signature: transactionData.transaction?.signatures?.[0] || "Unknown",
      blockTime: transactionData.blockTime
        ? new Date(transactionData.blockTime * 1000).toISOString()
        : "Unknown",
      fee: transactionData.meta?.fee || 0,
      status: transactionData.meta?.err ? "Failed" : "Success",
      accounts:
        transactionData.transaction?.message?.accountKeys?.map(
          (key: string) => key
        ) || [],
      instructions:
        transactionData.transaction?.message?.instructions?.map((ix: any) => ({
          programId: ix.programId,
          accounts: ix.accounts || [],
          data: ix.data || "",
        })) || [],
    };

    // 프롬프트가 제공된 경우 Gemini API를 통한 추가 분석 수행
    if (prompt) {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const additionalAnalysis = JSON.parse(text);

      return NextResponse.json({
        analysis: {
          ...analysis,
          ...additionalAnalysis,
        },
      });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("트랜잭션 분석 중 오류 발생:", error);
    return NextResponse.json(
      { error: "트랜잭션 분석 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
