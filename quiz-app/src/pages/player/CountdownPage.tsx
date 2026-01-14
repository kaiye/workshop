import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundPattern } from '../../components/common';
import { Countdown } from '../../components/game';
import { useGame } from '../../context/GameContext';

export function CountdownPage() {
  const navigate = useNavigate();
  const { state } = useGame();

  useEffect(() => {
    if (state.phase === 'question') {
      navigate('/question');
    }
  }, [state.phase, navigate]);

  const handleCountdownComplete = () => {
    // Wait for state sync from host
    setTimeout(() => {
      if (state.phase !== 'question') {
        navigate('/question');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <BackgroundPattern />

      <main className="relative z-10 flex-1 flex items-center justify-center">
        <Countdown from={3} onComplete={handleCountdownComplete} />
      </main>
    </div>
  );
}
