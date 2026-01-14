import { RouterProvider } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { router } from './router';

function App() {
  return (
    <GameProvider>
      <RouterProvider router={router} />
    </GameProvider>
  );
}

export default App;
