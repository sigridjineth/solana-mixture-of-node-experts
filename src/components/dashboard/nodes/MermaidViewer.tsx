"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Handle, Position } from "reactflow";
import { CustomNodeProps } from "@/types/node";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Maximize2, AlertCircle, Loader2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import mermaid from "mermaid";

// 백틱 제거하는 간단한 함수
const cleanMermaidCode = (code: string): string => {
  if (!code) return "";
  // 백틱과 mermaid 태그 제거
  return code.replace(/^```mermaid\s*\n/g, "").replace(/\n```\s*$/g, "");
};

export const MermaidViewer: React.FC<CustomNodeProps> = ({
  id,
  data,
  selected,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [dialogSvgContent, setDialogSvgContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const rawMermaidCode = data.mermaid?.mermaid || data.returnValue?.mermaid;
  const mermaidCode = rawMermaidCode ? cleanMermaidCode(rawMermaidCode) : "";

  // 다이어그램 렌더링 함수
  const renderMermaid = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // mermaid 초기화
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
      });

      // SVG 생성
      const { svg } = await mermaid.render(`mermaid-${id}`, mermaidCode);
      setSvgContent(svg);
      setIsLoading(false);
    } catch (err) {
      console.error("Mermaid 렌더링 오류:", err);
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  };

  // 다이어그램 실행 핸들러
  const handleRun = useCallback(() => {
    if (!mermaidCode) return;
    renderMermaid();
  }, [mermaidCode]);

  useEffect(() => {
    if (!mermaidCode) return;
    renderMermaid();
  }, [mermaidCode, id]);

  // 다이얼로그가 열릴 때 다이어그램 다시 렌더링
  useEffect(() => {
    if (!isOpen || !mermaidCode) return;

    const renderDialogMermaid = async () => {
      try {
        const { svg } = await mermaid.render(
          `mermaid-dialog-${id}`,
          mermaidCode
        );
        setDialogSvgContent(svg);
      } catch (err) {
        console.error("다이얼로그 Mermaid 렌더링 오류:", err);
      }
    };

    renderDialogMermaid();
  }, [isOpen, mermaidCode, id]);

  if (!mermaidCode) {
    return (
      <Card
        className={cn("min-w-64 shadow-md", selected && "ring-2 ring-primary")}
        style={{ width: "280px" }}
      >
        <CardHeader className="p-3">
          <CardTitle className="text-sm">Mermaid 코드가 없습니다</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className={cn(
          "shadow-md relative border-red-500",
          selected && "ring-2 ring-primary"
        )}
        style={{ width: "280px" }}
      >
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-medium">Mermaid Viewer</CardTitle>
          <Badge variant="outline" className="mt-1 text-xs">
            Diagram
          </Badge>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex items-center text-xs text-red-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            <p className="text-xs">{error}</p>
          </div>
        </CardContent>
        <Handle
          type="target"
          position={Position.Left}
          className="rounded-full bg-primary border-2 border-background"
          style={{
            width: "10px",
            height: "10px",
            minWidth: "10px",
            minHeight: "10px",
          }}
        />
      </Card>
    );
  }

  return (
    <>
      <Card
        className={cn("shadow-md relative", selected && "ring-2 ring-primary")}
        style={{ width: "280px" }}
        data-node-id={id}
      >
        <CardHeader className="p-3 pb-2 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-sm font-medium">
              Mermaid Viewer
            </CardTitle>
            <Badge variant="outline" className="mt-1 text-xs">
              Diagram
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRun}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          {isLoading ? (
            <div className="w-full h-[160px] bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
              <p className="text-xs text-gray-500">다이어그램 렌더링 중...</p>
            </div>
          ) : (
            <div
              className="w-full h-[160px] overflow-hidden flex justify-center items-center bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <div
                className="max-w-full max-h-full"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="p-1 flex justify-start">
          <Handle
            type="target"
            position={Position.Left}
            className="rounded-full bg-primary border-2 border-background"
            style={{
              width: "10px",
              height: "10px",
              minWidth: "10px",
              minHeight: "10px",
            }}
          />
        </CardFooter>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[90vw] max-h-[90vh] md:max-w-5xl p-4">
          <div className="flex items-center justify-center w-full h-full max-h-[80vh]">
            {dialogSvgContent ? (
              <div
                className="w-full h-full flex items-center justify-center overflow-auto"
                dangerouslySetInnerHTML={{ __html: dialogSvgContent }}
              />
            ) : (
              <div className="w-full h-full flex-1 bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
                <p className="text-gray-500">다이어그램 렌더링 중...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MermaidViewer;
