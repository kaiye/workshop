import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundPattern, Header, Button } from '../../components/common';
import { useGame } from '../../context/GameContext';

export function LobbyPage() {
  const navigate = useNavigate();
  const { state, startGame } = useGame();
  const { gameId, players, phase, questions } = state;

  // Redirect if no game created
  useEffect(() => {
    if (!gameId || !state.isHost) {
      navigate('/host/create');
    }
  }, [gameId, state.isHost, navigate]);

  // Navigate to control page when game starts
  useEffect(() => {
    if (phase === 'countdown' || phase === 'question') {
      navigate('/host/control');
    }
  }, [phase, navigate]);

  const handleStartGame = () => {
    if (players.length === 0) {
      // Allow starting with no players for testing
      console.warn('Starting game with no players');
    }
    startGame();
  };

  const handleBack = () => {
    navigate('/host/create');
  };

  return (
    <div className="bg-secondary min-h-screen flex flex-col font-body">
      <BackgroundPattern />

      <Header
        leftContent={
          <button
            onClick={handleBack}
            className="text-white hover:opacity-80 transition-opacity p-2"
          >
            <span className="material-icons-round text-2xl">arrow_back</span>
          </button>
        }
        centerContent={
          <span className="text-white font-display text-xl">Waiting Room</span>
        }
        rightContent={
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="material-icons-round">quiz</span>
            <span>{questions.length} Q</span>
          </div>
        }
      />

      <main className="relative z-10 flex-1 flex flex-col items-center p-6 w-full max-w-2xl mx-auto">
        {/* Game ID Display */}
        <div className="text-center mb-8">
          <p className="text-white/80 font-semibold mb-2">Game PIN</p>
          <div className="bg-white rounded-2xl px-8 py-6 shadow-cartoon">
            <h1 className="font-display text-5xl md:text-7xl text-gray-800 tracking-widest select-all">
              {gameId}
            </h1>
          </div>
          <p className="mt-4 text-white font-semibold">
            Share this PIN with players to join
          </p>
        </div>

        {/* Players List */}
        <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-cartoon mb-6 flex-1 max-h-96 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-gray-800">
              Players Joined
            </h2>
            <span className="bg-primary text-white px-3 py-1 rounded-full font-bold">
              {players.length}
            </span>
          </div>

          {players.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <span className="material-icons-round text-6xl mb-2">
                hourglass_empty
              </span>
              <p className="font-semibold">Waiting for players...</p>
              <p className="text-sm mt-1">
                Players can join at the home screen
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {players.map((player, index) => (
                  <div
                    key={player.id}
                    className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="material-icons-round text-primary">
                        person
                      </span>
                    </div>
                    <span className="font-bold text-gray-800 truncate">
                      {player.nickname}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Start Game Button */}
        <Button
          variant="dark"
          fullWidth
          onClick={handleStartGame}
          className="text-xl py-4"
        >
          <span className="material-icons-round text-2xl">play_arrow</span>
          <span>Start Game</span>
        </Button>

        <p className="mt-4 text-white/60 text-sm text-center">
          {players.length === 0
            ? 'You can start the game even without players for testing'
            : `${players.length} player${players.length > 1 ? 's' : ''} ready`}
        </p>
      </main>
    </div>
  );
}
