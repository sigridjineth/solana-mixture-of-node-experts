import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface MermaidViewerProps {
  data: {
    mermaid: string;
    imageUrl: string;
    width: number;
    height: number;
  };
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Card
        className="p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex flex-col items-center">
          <img
            src={data.imageUrl}
            alt="Mermaid Diagram"
            className="max-w-full h-auto"
            style={{
              width: "200px",
              height: "auto",
            }}
          />
          <p className="mt-2 text-sm text-gray-500">클릭하여 확대</p>
        </div>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <div className="flex flex-col items-center">
            <img
              src={data.imageUrl}
              alt="Mermaid Diagram"
              className="max-w-full h-auto"
              style={{
                width: "100%",
                height: "auto",
              }}
            />
            <div className="mt-4 text-sm text-gray-500">
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                {data.mermaid}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
