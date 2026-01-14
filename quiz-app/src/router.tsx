import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import {
  JoinPage,
  NicknamePage,
  WaitingPage,
  CountdownPage,
  QuestionPage,
  ResultPage,
} from './pages/player';

// Host pages will be lazy loaded
const hostPages = {
  CreateGamePage: () => import('./pages/host/CreateGamePage').then(m => ({ default: m.CreateGamePage })),
  LobbyPage: () => import('./pages/host/LobbyPage').then(m => ({ default: m.LobbyPage })),
  ControlPage: () => import('./pages/host/ControlPage').then(m => ({ default: m.ControlPage })),
  FinalResultPage: () => import('./pages/host/FinalResultPage').then(m => ({ default: m.FinalResultPage })),
};

import { lazy, Suspense } from 'react';

const CreateGamePage = lazy(hostPages.CreateGamePage);
const LobbyPage = lazy(hostPages.LobbyPage);
const ControlPage = lazy(hostPages.ControlPage);
const FinalResultPage = lazy(hostPages.FinalResultPage);

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-secondary flex items-center justify-center">
          <div className="text-white font-display text-2xl animate-pulse">
            Loading...
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  // Home
  { path: '/', element: <HomePage /> },

  // Player flow
  { path: '/join', element: <JoinPage /> },
  { path: '/nickname', element: <NicknamePage /> },
  { path: '/waiting', element: <WaitingPage /> },
  { path: '/countdown', element: <CountdownPage /> },
  { path: '/question', element: <QuestionPage /> },
  { path: '/result', element: <ResultPage /> },

  // Host flow
  {
    path: '/host/create',
    element: <SuspenseWrapper><CreateGamePage /></SuspenseWrapper>,
  },
  {
    path: '/host/lobby',
    element: <SuspenseWrapper><LobbyPage /></SuspenseWrapper>,
  },
  {
    path: '/host/control',
    element: <SuspenseWrapper><ControlPage /></SuspenseWrapper>,
  },
  {
    path: '/host/final',
    element: <SuspenseWrapper><FinalResultPage /></SuspenseWrapper>,
  },
]);
