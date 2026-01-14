import { useEffect, useState } from 'react';

interface CountdownProps {
  from?: number;
  onComplete: () => void;
}

export function Countdown({ from = 3, onComplete }: CountdownProps) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (count === 0) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <div className="flex items-center justify-center h-full">
      <span
        className={`
          font-display text-[180px] md:text-[200px] text-white
          text-shadow-lg tracking-wide
          animate-pulse-scale
        `}
        key={count}
      >
        {count === 0 ? 'GO!' : count}
      </span>
    </div>
  );
}
