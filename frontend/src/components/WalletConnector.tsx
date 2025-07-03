'use client';

import { Connector, useAccount, useConnect,useDisconnect } from "@starknet-react/core"
import { StarknetkitConnector, useStarknetkitConnectModal } from "starknetkit"
import { Button } from "./Button"


export default function WalletConnector() {
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { address } = useAccount()
  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
    modalTheme: "dark",
  })

  async function connectWallet() {
    const { connector } = await starknetkitConnectModal()
    if (!connector) {
      return;
    }
    await connect({ connector: connector as Connector });
  }

   if (!address) {
  return (
    <Button
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colorsdisabled:opacity-50"
      onClick={connectWallet}
    >
      Connect Wallet
    </Button>
  );
}

return (
  <div>
    <div>
      Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
    </div>
    <Button
      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
      onClick={() => disconnect()}
    >
      Disconnect
    </Button>
  </div>
);
}
