interface TimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  showBar?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

export function Timer({ totalSeconds, remainingSeconds, showBar = true }: TimerProps) {
  const percentage = (remainingSeconds / totalSeconds) * 100;
  const isLow = remainingSeconds <= 30;

  return (
    <div className="flex items-center gap-4">
      <span
        className={`
          font-bold text-lg
          ${isLow ? 'text-game-red animate-pulse' : 'text-white'}
        `}
      >
        {formatTime(remainingSeconds)}
      </span>
      {showBar && (
        <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
          <div
            className={`
              h-full transition-all duration-1000 rounded-full
              ${isLow ? 'bg-game-red' : 'bg-white'}
            `}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
