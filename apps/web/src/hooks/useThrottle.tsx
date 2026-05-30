import { useRef, useCallback } from 'react';
/**
 * Returns a throttled version of the callback that executes at most once per `delay` ms.
 */
export function useThrottle<Args extends unknown[]>(
  callback: (...args: Args) => void | Promise<void>,
  delay: number
): (...args: Args) => void {
  const lastCall = useRef<number>(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback((...args: Args) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall.current);

    if (remaining <= 0) {
      lastCall.current = now;
      callback(...args);
    } else if (!timer.current) {
      // Schedule trailing call
      timer.current = setTimeout(() => {
        lastCall.current = Date.now();
        timer.current = null;
        callback(...args);
      }, remaining);
    }
  }, [callback, delay]);
}
