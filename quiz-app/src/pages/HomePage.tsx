import { useNavigate } from 'react-router-dom';
import { BackgroundPattern, Header, Button } from '../components/common';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <BackgroundPattern />
      <Header />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-12">
          <h1 className="font-display text-6xl md:text-7xl text-white text-shadow-lg tracking-wide mb-4">
            Quiz<br />Game
          </h1>
          <p className="text-white/80 text-lg font-semibold">
            Learn together, compete together!
          </p>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-4">
          <Button
            onClick={() => navigate('/join')}
            variant="primary"
            fullWidth
            className="h-16 text-xl"
          >
            <span className="material-icons-round text-2xl">login</span>
            <span>Join Game</span>
          </Button>

          <Button
            onClick={() => navigate('/host/create')}
            variant="secondary"
            fullWidth
            className="h-16 text-xl"
          >
            <span className="material-icons-round text-2xl">add_circle</span>
            <span>Host Game</span>
          </Button>
        </div>
      </main>

      <footer className="relative z-10 w-full p-4 text-center">
        <p className="text-white/60 text-sm">
          Powered by React + Vite + Tailwind
        </p>
      </footer>
    </div>
  );
}
