import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundPattern, Header, Button } from '../../components/common';
import { useGame } from '../../context/GameContext';

export function FinalResultPage() {
  const navigate = useNavigate();
  const { state, resetGame } = useGame();
  const { players, questions, gameId } = state;

  // Redirect if no game
  useEffect(() => {
    if (!gameId) {
      navigate('/host/create');
    }
  }, [gameId, navigate]);

  // Sort players by score
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  const topThree = sortedPlayers.slice(0, 3);
  const restPlayers = sortedPlayers.slice(3);

  const handleNewGame = () => {
    resetGame();
    navigate('/host/create');
  };

  // Trophy/medal colors for top 3
  const medalColors = ['bg-amber-400', 'bg-gray-300', 'bg-amber-600'];
  const medalIcons = ['emoji_events', 'emoji_events', 'emoji_events'];

  return (
    <div className="bg-secondary min-h-screen flex flex-col font-body">
      <BackgroundPattern />

      <Header
        centerContent={
          <span className="text-white font-display text-xl">Final Results</span>
        }
      />

      <main className="relative z-10 flex-1 flex flex-col items-center p-6 w-full max-w-2xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.2)]">
            Game Over!
          </h1>
          <p className="mt-2 text-white/80 font-semibold">
            {questions.length} questions completed
          </p>
        </div>

        {/* Podium for Top 3 */}
        {topThree.length > 0 && (
          <div className="w-full mb-8">
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              {topThree[1] && (
                <div className="flex flex-col items-center">
                  <div className="bg-white rounded-2xl p-4 shadow-cartoon mb-2 w-28">
                    <div
                      className={`w-12 h-12 ${medalColors[1]} rounded-full flex items-center justify-center mx-auto mb-2`}
                    >
                      <span className="material-icons-round text-white text-2xl">
                        {medalIcons[1]}
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 text-center truncate">
                      {topThree[1].nickname}
                    </p>
                    <p className="font-display text-xl text-gray-600 text-center">
                      {topThree[1].score}
                    </p>
                  </div>
                  <div className="bg-gray-300 w-28 h-20 rounded-t-xl flex items-center justify-center">
                    <span className="font-display text-4xl text-white">2</span>
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <div className="flex flex-col items-center">
                  <div className="bg-white rounded-2xl p-6 shadow-cartoon mb-2 w-32 ring-4 ring-accent">
                    <div
                      className={`w-16 h-16 ${medalColors[0]} rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg`}
                    >
                      <span className="material-icons-round text-white text-3xl">
                        {medalIcons[0]}
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 text-center truncate text-lg">
                      {topThree[0].nickname}
                    </p>
                    <p className="font-display text-2xl text-gray-600 text-center">
                      {topThree[0].score}
                    </p>
                  </div>
                  <div className="bg-accent w-32 h-28 rounded-t-xl flex items-center justify-center">
                    <span className="font-display text-5xl text-gray-800">1</span>
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <div className="flex flex-col items-center">
                  <div className="bg-white rounded-2xl p-4 shadow-cartoon mb-2 w-28">
                    <div
                      className={`w-12 h-12 ${medalColors[2]} rounded-full flex items-center justify-center mx-auto mb-2`}
                    >
                      <span className="material-icons-round text-white text-2xl">
                        {medalIcons[2]}
                      </span>
                    </div>
                    <p className="font-bold text-gray-800 text-center truncate">
                      {topThree[2].nickname}
                    </p>
                    <p className="font-display text-xl text-gray-600 text-center">
                      {topThree[2].score}
                    </p>
                  </div>
                  <div className="bg-amber-600 w-28 h-16 rounded-t-xl flex items-center justify-center">
                    <span className="font-display text-4xl text-white">3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rest of Players */}
        {restPlayers.length > 0 && (
          <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-cartoon mb-6 max-h-60 overflow-y-auto">
            <h2 className="font-display text-xl text-gray-800 mb-4">
              All Players
            </h2>
            <div className="space-y-3">
              {restPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center p-3 bg-gray-50 rounded-xl"
                >
                  <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 font-bold text-gray-600">
                    {index + 4}
                  </span>
                  <span className="font-bold text-gray-800 flex-1 truncate">
                    {player.nickname}
                  </span>
                  <span className="font-display text-xl text-gray-600">
                    {player.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Players Message */}
        {players.length === 0 && (
          <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-cartoon mb-6 text-center">
            <span className="material-icons-round text-6xl text-gray-300 mb-4">
              group_off
            </span>
            <p className="text-gray-500 font-semibold">
              No players participated in this game
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="w-full space-y-3">
          <Button
            variant="dark"
            fullWidth
            onClick={handleNewGame}
            className="text-xl py-4"
          >
            <span className="material-icons-round">add</span>
            <span>New Game</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
