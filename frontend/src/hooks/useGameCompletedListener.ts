import { useEffect, useRef } from 'react';
import { Contract, Provider } from 'starknet';

export function useGameCompletedListener({
  contract,
  playerAddress,
  gameId,
  onCompleted,
  pollInterval = 3000,
}: {
  contract: Contract | null;
  playerAddress: string | undefined;
  gameId: string | null;
  onCompleted: (event: any) => void;
  pollInterval?: number;
}) {
  const lastCompletedGameId = useRef<string | null>(null);

  useEffect(() => {
    if (!contract || !playerAddress || !gameId) return;
    let interval: NodeJS.Timeout;
    let cancelled = false;

    // Use the RPC URL from .env
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || '';
    const provider = new Provider({ nodeUrl: rpcUrl });
    // Create a new contract instance with the custom provider
    const pollingContract = new Contract(contract.abi, contract.address, provider);

    const poll = async () => {
      try {
        // Always use the custom provider for polling
        const state = await pollingContract.call('get_game_state', [gameId]);
        const isActive = Array.isArray(state)
          ? Boolean(state[4])
          : typeof state === 'object' && state !== null
            ? Boolean(Object.values(state)[4])
            : false;
        if (!isActive && gameId && lastCompletedGameId.current !== gameId) {
          lastCompletedGameId.current = gameId;
          onCompleted(state);
        }
      } catch (err) {
        // Ignore errors
      }
    };
    interval = setInterval(poll, pollInterval);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [contract, playerAddress, gameId, onCompleted, pollInterval]);
} 