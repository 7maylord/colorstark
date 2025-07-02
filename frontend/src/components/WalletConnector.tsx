'use client';

import { useStarknet } from '../hooks/useStarknet';

export default function WalletConnector() {
  const { account, connectWallet } = useStarknet();

  if (account) return null;

  return (
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      onClick={connectWallet}
    >
      Connect Wallet
    </button>
  );
}