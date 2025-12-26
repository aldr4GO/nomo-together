import { useEffect, useRef } from 'react';

/**
 * Custom hook for polling API endpoint
 * @param {Function} fetchFunction - Function that returns a promise
 * @param {number} interval - Polling interval in milliseconds
 * @param {boolean} enabled - Whether polling is enabled
 */
export function usePolling(fetchFunction, interval = 10000, enabled = true) {
  const savedCallback = useRef(fetchFunction);
  const isPolling = useRef(false);

  useEffect(() => {
    savedCallback.current = fetchFunction;
  }, [fetchFunction]);

  useEffect(() => {
    if (!enabled) return;

    let intervalId;

    const poll = async () => {
      if (isPolling.current) return; // prevent overlap
      isPolling.current = true;

      try {
        await savedCallback.current();
      } catch {
        // swallow errors — polling must be resilient
      } finally {
        isPolling.current = false;
      }
    };

    // 🔑 IMPORTANT: delay first poll slightly
    const timeoutId = setTimeout(poll, 1200);

    intervalId = setInterval(poll, interval);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [interval, enabled]);
}


