interface Player {
  id: string;
  nickname: string;
  score: number;
}

interface LeaderboardProps {
  players: Player[];
  currentPlayerId?: string;
  maxDisplay?: number;
}

const medals = ['gold', 'silver', 'bronze'];
const medalColors = ['bg-amber-400', 'bg-gray-300', 'bg-amber-600'];

export function Leaderboard({ players, currentPlayerId, maxDisplay = 3 }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const displayPlayers = sorted.slice(0, maxDisplay);

  return (
    <div className="space-y-3 w-full max-w-md">
      {displayPlayers.map((player, index) => {
        const isCurrentPlayer = player.id === currentPlayerId;
        const isFirst = index === 0;

        return (
          <div
            key={player.id}
            className={`
              flex items-center p-4 rounded-xl shadow-cartoon
              ${isFirst ? 'bg-accent' : 'bg-white'}
              ${isCurrentPlayer ? 'ring-4 ring-primary' : ''}
            `}
          >
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center mr-4
                ${medalColors[index] || 'bg-gray-200'}
              `}
            >
              <span className="material-icons-round text-white text-xl">
                {medals[index] ? 'emoji_events' : 'person'}
              </span>
            </div>
            <span className="font-bold text-xl flex-1 text-gray-800 truncate">
              {player.nickname}
              {isCurrentPlayer && <span className="text-primary ml-2">(You)</span>}
            </span>
            <span className="font-display text-2xl text-gray-800">{player.score}</span>
          </div>
        );
      })}
    </div>
  );
}
