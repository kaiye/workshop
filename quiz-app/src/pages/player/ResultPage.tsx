import { useNavigate } from 'react-router-dom';
import { BackgroundPattern, Header, Button } from '../../components/common';
import { Leaderboard } from '../../components/game';
import { useGame } from '../../context/GameContext';

export function ResultPage() {
  const navigate = useNavigate();
  const { state, getCurrentPlayer, resetGame } = useGame();
  const player = getCurrentPlayer();

  const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);
  const playerRank = sortedPlayers.findIndex((p) => p.id === player?.id) + 1;

  const handlePlayAgain = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <BackgroundPattern />
      <Header />

      <main className="relative z-10 flex-1 flex flex-col items-center p-6">
        {/* Title */}
        <div className="text-center mb-8 mt-4">
          <h1 className="font-display text-4xl md:text-5xl text-white text-shadow-lg">
            Game Over!
          </h1>
        </div>

        {/* Player Score Card */}
        {player && (
          <div className="w-full max-w-md bg-white rounded-2xl shadow-cartoon p-6 mb-8">
            <div className="text-center">
              <p className="text-gray-500 font-semibold mb-2">Your Score</p>
              <p className="font-display text-5xl text-primary mb-2">
                {player.score}
              </p>
              <p className="text-gray-600 font-bold">
                {playerRank === 1 && '1st Place!'}
                {playerRank === 2 && '2nd Place!'}
                {playerRank === 3 && '3rd Place!'}
                {playerRank > 3 && `${playerRank}th Place`}
              </p>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="w-full max-w-md mb-8">
          <h2 className="text-white font-bold text-xl mb-4 text-center">
            Top Players
          </h2>
          <Leaderboard
            players={state.players}
            currentPlayerId={state.currentPlayerId || undefined}
            maxDisplay={5}
          />
        </div>

        {/* Play Again Button */}
        <Button
          onClick={handlePlayAgain}
          variant="primary"
          className="w-full max-w-xs"
        >
          <span className="material-icons-round">replay</span>
          <span>Play Again</span>
        </Button>
      </main>
    </div>
  );
}
