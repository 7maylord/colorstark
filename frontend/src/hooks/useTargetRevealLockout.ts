import { useState, useRef, useEffect, useCallback } from "react";

export function useTargetRevealLockout(lockoutMs = 180000, revealMs = 4000) {
  const [showTarget, setShowTarget] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const revealTimeout = useRef<NodeJS.Timeout | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  const handleShowTarget = useCallback(() => {
    if (lockedUntil && Date.now() < lockedUntil) return;
    setShowTarget(true);
    revealTimeout.current = setTimeout(() => {
      setShowTarget(false);
      const until = Date.now() + lockoutMs;
      setLockedUntil(until);
      setCountdown(Math.ceil(lockoutMs / 1000));
    }, revealMs);
  }, [lockedUntil, lockoutMs, revealMs]);

  // Countdown logic
  useEffect(() => {
    if (!lockedUntil) return;
    countdownInterval.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        setLockedUntil(null);
        setCountdown(0);
        clearInterval(countdownInterval.current!);
      }
    }, 1000);
    return () => clearInterval(countdownInterval.current!);
  }, [lockedUntil]);

  // Cleanup on unmount
  useEffect(() => () => {
    if (revealTimeout.current) clearTimeout(revealTimeout.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }, []);

  const reset = useCallback(() => {
    setShowTarget(false);
    setLockedUntil(null);
    setCountdown(0);
    if (revealTimeout.current) clearTimeout(revealTimeout.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }, []);

  return {
    showTarget,
    handleShowTarget,
    targetRevealLocked: !!lockedUntil && Date.now() < lockedUntil,
    targetRevealCountdown: countdown,
    resetTargetRevealLockout: reset,
  };
} 