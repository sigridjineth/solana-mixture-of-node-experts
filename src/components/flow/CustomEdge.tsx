import React from "react";
import { EdgeProps, getBezierPath } from "reactflow";
import { X } from "lucide-react";
import { useFlow } from "../providers/FlowProvider";

// 커스텀 엣지 컴포넌트
export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { deleteEdge } = useFlow();

  // 엣지의 중앙 위치 계산
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  // 베지어 경로 계산
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // 삭제 버튼 클릭 핸들러
  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    deleteEdge(id);
  };

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: "#555",
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <foreignObject
        width={20}
        height={20}
        x={centerX - 10}
        y={centerY - 10}
        className="react-flow__edge-button"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            borderRadius: "50%",
            border: "1px solid #555",
            cursor: "pointer",
          }}
          onClick={handleDelete}
        >
          <X size={14} style={{ color: "#555" }} />
        </div>
      </foreignObject>
    </>
  );
}
