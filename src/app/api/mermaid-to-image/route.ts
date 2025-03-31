import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
  try {
    const { mermaid } = await request.json();

    if (!mermaid) {
      return NextResponse.json(
        { error: "Mermaid 코드가 필요합니다" },
        { status: 400 }
      );
    }

    // Puppeteer 브라우저 실행
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    // Mermaid.js CDN 포함된 HTML 생성
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
          <style>
            body { margin: 0; padding: 20px; background: white; }
            .mermaid { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <div class="mermaid">
            ${mermaid}
          </div>
          <script>
            mermaid.initialize({ startOnLoad: true });
          </script>
        </body>
      </html>
    `;

    // HTML 로드
    await page.setContent(html);

    // 다이어그램이 렌더링될 때까지 대기
    await page.waitForSelector(".mermaid svg");

    // SVG 요소의 크기 가져오기
    const dimensions = await page.evaluate(() => {
      const svg = document.querySelector(".mermaid svg");
      if (!svg) {
        throw new Error("SVG 요소를 찾을 수 없습니다");
      }
      return {
        width: svg.getBoundingClientRect().width,
        height: svg.getBoundingClientRect().height,
      };
    });

    // SVG를 PNG로 변환
    const svgElement = await page.$(".mermaid svg");
    if (!svgElement) {
      throw new Error("SVG 요소를 찾을 수 없습니다");
    }
    const imageBuffer = await svgElement.screenshot({
      type: "png",
      omitBackground: true,
    });

    // 브라우저 종료
    await browser.close();

    // Base64 이미지 URL 생성
    const base64Image = `data:image/png;base64,${Buffer.from(
      imageBuffer
    ).toString("base64")}`;

    return NextResponse.json({
      imageUrl: base64Image,
      width: dimensions.width,
      height: dimensions.height,
    });
  } catch (error) {
    console.error("Mermaid 이미지 변환 중 오류 발생:", error);
    return NextResponse.json(
      { error: "Mermaid 이미지 변환 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
