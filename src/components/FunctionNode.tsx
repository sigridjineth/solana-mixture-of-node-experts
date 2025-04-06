import React, { useState, useEffect } from "react";
import { NodeProps, Handle, Position } from "reactflow";
import {
  SolanaOrcaIcon,
  SolanaJupyterIcon,
  SolanaRaydiumIcon,
  SolanaHuggingFaceIcon,
} from "@/components/icons/WebpIcons";

// 드롭다운 옵션을 가져오는 함수
const getInputOptions = (functionId: string, inputName: string, providerValue?: string) => {
  if (functionId === "model-provider-selector") {
    if (inputName === "provider") {
      return [
        { label: "Hugging Face", value: "huggingface" },
        { label: "OpenRouter", value: "openrouter" },
      ];
    } else if (inputName === "model") {
      // 선택된 프로바이더에 따라 모델 목록 필터링
      if (providerValue === "huggingface") {
        return [
          {
            label: "Mixture of Multi-chain Expert 1 Pro",
            value: "mome-1.0-pro-exp",
          },
          {
            label: "Mixture of Multi-chain Expert 1",
            value: "mome-1.0",
          },
        ];
      } else if (providerValue === "openrouter") {
        return [
          { label: "GPT-4o-mini", value: "openai/gpt-4o-mini" },
          { label: "GPT-o1-mini", value: "openai/o1-mini" },
          { label: "Claude 3.5 Sonnet", value: "anthropic/claude-3.5-sonnet" },
          { label: "Claude 3.7 Sonnet", value: "anthropic/claude-3.7-sonnet" },
          { label: "Gemini 2.0 Flash", value: "google/gemini-2.0-flash" },
          { label: "Gemini 1.5 Pro", value: "google/gemini-1.5-pro" },
        ];
      }
    }
  }
  return [];
};

// 임시 NodeData 타입 정의
interface NodeData {
  function?: any;
  setInputs?: (inputs: Record<string, any>) => void;
}

// 간단한 정보 아이콘 컴포넌트
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Function icons mapping
const functionIcons: Record<string, React.ReactNode> = {
  "solana-orca": <SolanaOrcaIcon className="h-4 w-4" />,
  "solana-jupyter": <SolanaJupyterIcon className="h-4 w-4" />,
  "solana-raydium": <SolanaRaydiumIcon className="h-4 w-4" />,
  "solana-huggingface": <SolanaHuggingFaceIcon className="h-4 w-4" />,
};

const FunctionNodeComponent = ({ id, data, isConnectable, selected }: NodeProps<NodeData>) => {
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [showModal, setShowModal] = useState(false);

  // 모델 프로바이더 선택 상태 관리
  const [selectedProvider, setSelectedProvider] = useState<string>("huggingface");

  // 임시 edges 변수 - 타입 정의 추가
  const edges: Array<{ target: string; targetHandle: string }> = [];

  useEffect(() => {
    if (data.function?.id === "model-provider-selector" && inputs.provider) {
      setSelectedProvider(inputs.provider);
    }
  }, [data.function?.id, inputs.provider]);

  // Check if this is a "To be Continued" node
  const isToBeContinuedNode =
    data.function?.id === "solana-orca" ||
    data.function?.id === "solana-jupyter" ||
    data.function?.id === "solana-raydium" ||
    data.function?.id === "solana-huggingface";

  // Handle node click for "To be Continued" nodes
  const handleNodeClick = () => {
    if (isToBeContinuedNode) {
      setShowModal(true);
    }
  };

  // Get the icon for the node
  const getNodeIcon = () => {
    if (data.function?.id && functionIcons[data.function.id]) {
      return functionIcons[data.function.id];
    }

    // Fallback to icon from function data if available
    if (data.function?.icon) {
      return (
        <img
          src={data.function.icon}
          alt={data.function.name || "Node icon"}
          className="w-4 h-4 object-contain"
        />
      );
    }

    return null;
  };

  const nodeIcon = getNodeIcon();

  return (
    <>
      <div
        className={`px-4 py-2 shadow-md rounded-md bg-white border-2 ${
          selected ? "border-blue-500" : "border-slate-300"
        }`}
        style={{ width: 400 }}
        onClick={handleNodeClick}
      >
        <div className="flex items-center gap-2 mb-2">
          {nodeIcon}
          <h3 className="font-bold text-sm">{data.function?.name}</h3>
        </div>
        <div className="flex flex-col gap-2 my-2">
          {data.function?.inputs?.map((input) => {
            const isInputConnected = edges.some(
              (edge) => edge.target === id && edge.targetHandle === input.name
            );

            // 입력 필드 타입 확인
            const isSelectInput =
              data.function?.id === "model-provider-selector" &&
              (input.name === "provider" || input.name === "model");

            // API 키 입력인지 확인
            const isApiKeyInput =
              data.function?.id === "model-provider-selector" && input.name === "apiKey";

            return (
              <div key={input.name} className="flex items-center gap-2 w-full relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 -left-4 w-2 h-2 bg-blue-500 rounded-full cursor-crosshair z-10"
                  style={{ zIndex: 100 }}
                />
                <Handle
                  type="target"
                  position={Position.Left}
                  id={input.name}
                  className={`w-4 h-4 border-2 ${
                    isInputConnected
                      ? "border-green-500 bg-green-300"
                      : "border-slate-400 bg-slate-200"
                  }`}
                  isConnectable={isConnectable}
                />

                <div className="flex flex-col w-full">
                  <div className="flex items-center gap-2">
                    <label className="font-mono text-xs text-slate-500">
                      {input.name}
                      {input.required && <span className="text-red-500">*</span>}
                    </label>
                    {input.description && (
                      <div className="text-slate-400 cursor-help" title={input.description}>
                        <InfoIcon />
                      </div>
                    )}
                  </div>

                  {isSelectInput ? (
                    <select
                      className="w-full border rounded-md p-1 text-sm"
                      value={inputs[input.name] || input.default || ""}
                      onChange={(e) => {
                        const newInputs = {
                          ...inputs,
                          [input.name]: e.target.value,
                        };
                        setInputs(newInputs);
                        data.setInputs?.(newInputs);
                        if (input.name === "provider") {
                          setSelectedProvider(e.target.value);
                        }
                      }}
                      disabled={isInputConnected}
                    >
                      <option value="">Select...</option>
                      {getInputOptions(data.function?.id || "", input.name, selectedProvider).map(
                        (option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        )
                      )}
                    </select>
                  ) : isApiKeyInput ? (
                    <input
                      type="password"
                      className="w-full border rounded-md p-1 text-sm"
                      placeholder="Enter API key (stored securely)"
                      value={inputs[input.name] || ""}
                      onChange={(e) => {
                        const newInputs = {
                          ...inputs,
                          [input.name]: e.target.value,
                        };
                        setInputs(newInputs);
                        data.setInputs?.(newInputs);
                      }}
                      disabled={isInputConnected}
                    />
                  ) : (
                    <input
                      type="text"
                      className="w-full border rounded-md p-1 text-sm"
                      placeholder={`${input.default || ""}`}
                      value={inputs[input.name] || ""}
                      onChange={(e) => {
                        const newInputs = {
                          ...inputs,
                          [input.name]: e.target.value,
                        };
                        setInputs(newInputs);
                        data.setInputs?.(newInputs);
                      }}
                      disabled={isInputConnected}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Output Handle */}
        {data.function?.output && (
          <div className="flex items-center justify-end mt-2 relative">
            <Handle
              type="source"
              position={Position.Right}
              id="output"
              className="w-4 h-4 border-2 border-green-500 bg-green-300"
            />
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 w-2 h-2 bg-green-500 rounded-full cursor-crosshair z-10" />
          </div>
        )}
      </div>
    </>
  );
};

export default FunctionNodeComponent;
