import { useEffect, useRef } from 'react';

/**
 * Custom hook for polling API endpoint
 * @param {Function} fetchFunction - Function that returns a promise
 * @param {number} interval - Polling interval in milliseconds
 * @param {boolean} enabled - Whether polling is enabled
 */
export function usePolling(fetchFunction, interval = 10000, enabled = true) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = fetchFunction;
  }, [fetchFunction]);

  useEffect(() => {
    if (!enabled) return;

    let intervalId;

    const poll = async () => {
      try {
        await savedCallback.current();
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial fetch
    poll();

    // Set up interval
    intervalId = setInterval(poll, interval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [interval, enabled]);
}

