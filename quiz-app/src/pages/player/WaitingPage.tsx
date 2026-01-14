import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundPattern, Header } from '../../components/common';
import { useGame } from '../../context/GameContext';

export function WaitingPage() {
  const navigate = useNavigate();
  const { state, getCurrentPlayer } = useGame();
  const player = getCurrentPlayer();

  useEffect(() => {
    if (state.phase === 'countdown') {
      navigate('/countdown');
    } else if (state.phase === 'question') {
      navigate('/question');
    }
  }, [state.phase, navigate]);

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <BackgroundPattern />
      <Header />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-white text-shadow-lg mb-4">
            You're In!
          </h1>
          {player && (
            <p className="font-display text-3xl text-white/90">
              {player.nickname}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
            <span className="material-icons-round text-white text-4xl">
              hourglass_empty
            </span>
          </div>

          <p className="text-white/80 text-lg font-semibold text-center">
            Waiting for host to start the game...
          </p>

          <div className="mt-4 bg-white/10 rounded-xl px-6 py-3">
            <p className="text-white/60 text-sm">
              {state.players.length} player{state.players.length !== 1 ? 's' : ''} joined
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
