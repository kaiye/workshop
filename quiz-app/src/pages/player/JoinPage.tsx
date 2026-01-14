import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundPattern, Header, Button, Input } from '../../components/common';
import { useGame } from '../../context/GameContext';

export function JoinPage() {
  const navigate = useNavigate();
  const { joinGame } = useGame();
  const [gameId, setGameId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!gameId.trim()) {
      setError('Please enter a Game ID');
      return;
    }

    const success = joinGame(gameId.toUpperCase());
    if (success) {
      navigate('/nickname');
    } else {
      setError('Game not found. Please check the ID.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <BackgroundPattern />
      <Header
        leftContent={
          <button
            onClick={() => navigate('/')}
            className="text-white hover:opacity-80 transition-opacity p-2 rounded-full"
          >
            <span className="material-icons-round text-2xl">arrow_back</span>
          </button>
        }
      />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl md:text-6xl text-white text-shadow-lg tracking-wide leading-tight">
            Join<br />Game
          </h1>
        </div>

        <div className="w-full flex flex-col items-center gap-4">
          <div className="w-full max-w-xs">
            <Input
              type="text"
              placeholder="Game ID"
              value={gameId}
              onChange={(e) => {
                setGameId(e.target.value.toUpperCase());
                setError('');
              }}
              onKeyDown={handleKeyDown}
              maxLength={6}
              error={error}
              className="uppercase tracking-widest"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full max-w-xs h-14"
          >
            <span className="material-icons-round text-3xl">arrow_forward</span>
          </Button>
        </div>
      </main>

      <footer className="relative z-10 w-full p-4 text-center">
        <p className="text-white/80 text-sm font-semibold">
          Enter the Game ID shown on the host's screen
        </p>
      </footer>
    </div>
  );
}
