import { useEffect, useState } from 'react';

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const reset = (nextSeconds = initialSeconds) => setSeconds(nextSeconds);

  return { seconds, reset, isFinished: seconds <= 0 };
}
export {};