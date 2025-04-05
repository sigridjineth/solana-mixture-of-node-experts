import React from "react";

interface WebpIconProps {
  className?: string;
}

export const SolanaOrcaIcon: React.FC<WebpIconProps> = ({ className = "h-4 w-4" }) => {
  return <img src="/solana-orca.webp" alt="Solana Orca" className={className} />;
};

export const SolanaJupyterIcon: React.FC<WebpIconProps> = ({ className = "h-4 w-4" }) => {
  return <img src="/solana-jupyter.webp" alt="Solana Jupyter" className={className} />;
};

export const SolanaRaydiumIcon: React.FC<WebpIconProps> = ({ className = "h-4 w-4" }) => {
  return <img src="/solana-raydium.webp" alt="Solana Raydium" className={className} />;
};

export const SolanaHuggingFaceIcon: React.FC<WebpIconProps> = ({ className = "h-4 w-4" }) => {
  return <img src="/huggingface-color.svg" alt="HuggingFace" className={className} />;
};
