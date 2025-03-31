import { NextRequest, NextResponse } from "next/server";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL_NAME = "gemini-2.0-flash";

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { transactionData } = await req.json();

    if (!transactionData) {
      return NextResponse.json(
        { error: "트랜잭션 데이터가 누락되었습니다." },
        { status: 400 }
      );
    }

    // Initialize the Generative AI API with your API key
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // Safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];

    // Gemini API 요청용 프롬프트 생성 (영문)
    const prompt = `
      You are a Solana blockchain transaction analysis expert.
      
      Please analyze the following Solana transaction and generate a concise 2-3 line summary.
      Clearly explain the transaction type, related programs, and main operation in Korean.
      Minimize technical terminology while including important transaction information.
      
      Transaction data:
      ${JSON.stringify(transactionData, null, 2)}
    `;

    // Generate content with the Gemini model
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 200,
      },
    });

    const response = result.response;
    const generatedText =
      response.text() || "트랜잭션 분석 결과를 생성할 수 없습니다.";

    return NextResponse.json({ analysis: generatedText });
  } catch (error) {
    console.error("Gemini API 요청 오류:", error);
    return NextResponse.json(
      {
        error: `트랜잭션 분석 중 오류가 발생했습니다: ${
          (error as Error).message
        }`,
      },
      { status: 500 }
    );
  }
}
