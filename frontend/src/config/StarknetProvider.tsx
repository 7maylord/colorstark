"use client";

import { StarknetConfig } from "@starknet-react/core";
import { InjectedConnector } from "starknetkit/injected";
import { mainnet, sepolia } from "@starknet-react/chains";
import { publicProvider } from "@starknet-react/core";

const connectors = [
  new InjectedConnector({
    options: { id: "argentX", name: "Ready Wallet (formerly Argent)" },
  }),
  new InjectedConnector({
    options: { id: "braavos", name: "Braavos" },
  }),
];

export default function StarknetProvider({ children }: { children: React.ReactNode }) {
  return (
    <StarknetConfig
      chains={[mainnet, sepolia]}
      provider={publicProvider()}
      connectors={connectors}
      autoConnect={true}
    >
      {children}
    </StarknetConfig>
  );
} 