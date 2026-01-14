import type { ReactNode } from 'react';
import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { GameState, GameAction, Question, Player } from '../types/game';
import { INITIAL_GAME_STATE } from '../types/game';

const STORAGE_KEY = 'quiz_game_state';
const CHANNEL_NAME = 'quiz_game_channel';

function generateGameId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

function generatePlayerId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'CREATE_GAME':
      return {
        ...state,
        gameId: action.gameId,
        questions: action.questions,
        phase: 'waiting',
        isHost: true,
        currentQuestionIndex: 0,
        totalTimeRemaining: 300,
      };

    case 'JOIN_GAME':
      return {
        ...state,
        gameId: action.gameId,
        isHost: false,
      };

    case 'SET_PLAYER': {
      const player: Player = {
        id: action.playerId,
        nickname: action.nickname,
        score: 0,
        currentAnswer: null,
        isCorrect: null,
        joinedAt: Date.now(),
      };
      return {
        ...state,
        currentPlayerId: action.playerId,
        players: [...state.players.filter((p) => p.id !== action.playerId), player],
        phase: 'waiting',
      };
    }

    case 'ADD_PLAYER':
      if (state.players.some((p) => p.id === action.player.id)) {
        return state;
      }
      return {
        ...state,
        players: [...state.players, action.player],
      };

    case 'START_COUNTDOWN':
      return {
        ...state,
        phase: 'countdown',
      };

    case 'START_QUESTION':
      return {
        ...state,
        phase: 'question',
        players: state.players.map((p) => ({
          ...p,
          currentAnswer: null,
          isCorrect: null,
        })),
      };

    case 'SUBMIT_ANSWER': {
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const isCorrect = action.answer === currentQuestion?.correctAnswer;
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.playerId
            ? {
                ...p,
                currentAnswer: action.answer,
                isCorrect,
                score: isCorrect ? p.score + 100 : p.score,
              }
            : p
        ),
      };
    }

    case 'SHOW_FEEDBACK':
      return {
        ...state,
        phase: 'feedback',
      };

    case 'NEXT_QUESTION': {
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex >= state.questions.length) {
        return {
          ...state,
          phase: 'finished',
        };
      }
      return {
        ...state,
        currentQuestionIndex: nextIndex,
        phase: 'question',
        players: state.players.map((p) => ({
          ...p,
          currentAnswer: null,
          isCorrect: null,
        })),
      };
    }

    case 'END_GAME':
      return {
        ...state,
        phase: 'finished',
      };

    case 'TICK_TIMER':
      if (state.totalTimeRemaining <= 0) {
        return {
          ...state,
          phase: 'finished',
          totalTimeRemaining: 0,
        };
      }
      return {
        ...state,
        totalTimeRemaining: state.totalTimeRemaining - 1,
      };

    case 'SYNC_STATE': {
      // Preserve current player's answer state to avoid race condition
      const currentPlayer = state.players.find((p) => p.id === state.currentPlayerId);
      const syncedPlayers = action.state.players.map((p) => {
        if (p.id === state.currentPlayerId && currentPlayer && currentPlayer.currentAnswer !== null) {
          // Keep the local player's answer state if they've already answered
          return {
            ...p,
            currentAnswer: currentPlayer.currentAnswer,
            isCorrect: currentPlayer.isCorrect,
            score: currentPlayer.score,
          };
        }
        return p;
      });

      return {
        ...action.state,
        players: syncedPlayers,
        currentPlayerId: state.currentPlayerId,
        isHost: state.isHost,
      };
    }

    case 'RESET':
      return INITIAL_GAME_STATE;

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  createGame: (questions: Question[]) => string;
  joinGame: (gameId: string) => boolean;
  setPlayer: (nickname: string) => void;
  startGame: () => void;
  submitAnswer: (answer: number) => void;
  showFeedback: () => void;
  nextQuestion: () => void;
  endGame: () => void;
  resetGame: () => void;
  getCurrentQuestion: () => Question | null;
  getCurrentPlayer: () => Player | null;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_GAME_STATE);

  // BroadcastChannel for cross-tab communication
  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'STATE_SYNC' && !state.isHost) {
        dispatch({ type: 'SYNC_STATE', state: payload });
      } else if (type === 'PLAYER_JOINED' && state.isHost) {
        dispatch({ type: 'ADD_PLAYER', player: payload });
      } else if (type === 'ANSWER_SUBMITTED' && state.isHost) {
        dispatch({ type: 'SUBMIT_ANSWER', playerId: payload.playerId, answer: payload.answer });
      }
    };

    return () => channel.close();
  }, [state.isHost]);

  // Broadcast state changes when host
  useEffect(() => {
    if (state.isHost && state.gameId) {
      console.log('[GameContext] Saving host state to localStorage:', {
        gameId: state.gameId,
        phase: state.phase,
        questionsCount: state.questions.length,
      });
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({ type: 'STATE_SYNC', payload: state });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      channel.close();
    }
  }, [state, state.isHost, state.gameId]);

  // Timer
  useEffect(() => {
    if (state.phase === 'question' && state.isHost) {
      const timer = setInterval(() => {
        dispatch({ type: 'TICK_TIMER' });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.phase, state.isHost]);

  const createGame = useCallback((questions: Question[]) => {
    const gameId = generateGameId();
    dispatch({ type: 'CREATE_GAME', gameId, questions });
    return gameId;
  }, []);

  const joinGame = useCallback((gameId: string) => {
    const normalizedInput = gameId.toUpperCase().trim();
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      console.log('[joinGame] No game state in localStorage');
      return false;
    }

    try {
      const hostState = JSON.parse(stored) as GameState;
      const storedGameId = (hostState.gameId || '').toUpperCase().trim();

      console.log('[joinGame] Comparing:', { input: normalizedInput, stored: storedGameId });

      if (storedGameId && storedGameId === normalizedInput) {
        dispatch({ type: 'JOIN_GAME', gameId: storedGameId });
        dispatch({ type: 'SYNC_STATE', state: hostState });
        return true;
      }
    } catch (e) {
      console.error('[joinGame] Failed to parse stored state:', e);
    }

    return false;
  }, []);

  const setPlayer = useCallback((nickname: string) => {
    const playerId = generatePlayerId();
    dispatch({ type: 'SET_PLAYER', playerId, nickname });

    // Notify host
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const player: Player = {
      id: playerId,
      nickname,
      score: 0,
      currentAnswer: null,
      isCorrect: null,
      joinedAt: Date.now(),
    };
    channel.postMessage({ type: 'PLAYER_JOINED', payload: player });
    channel.close();
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_COUNTDOWN' });
    setTimeout(() => {
      dispatch({ type: 'START_QUESTION' });
    }, 4000); // 3-2-1-GO!
  }, []);

  const submitAnswer = useCallback(
    (answer: number) => {
      if (state.currentPlayerId) {
        dispatch({ type: 'SUBMIT_ANSWER', playerId: state.currentPlayerId, answer });

        // Notify host
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({
          type: 'ANSWER_SUBMITTED',
          payload: { playerId: state.currentPlayerId, answer },
        });
        channel.close();
      }
    },
    [state.currentPlayerId]
  );

  const showFeedback = useCallback(() => {
    dispatch({ type: 'SHOW_FEEDBACK' });
  }, []);

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  const endGame = useCallback(() => {
    dispatch({ type: 'END_GAME' });
  }, []);

  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET' });
  }, []);

  const getCurrentQuestion = useCallback(() => {
    return state.questions[state.currentQuestionIndex] || null;
  }, [state.questions, state.currentQuestionIndex]);

  const getCurrentPlayer = useCallback(() => {
    return state.players.find((p) => p.id === state.currentPlayerId) || null;
  }, [state.players, state.currentPlayerId]);

  return (
    <GameContext.Provider
      value={{
        state,
        createGame,
        joinGame,
        setPlayer,
        startGame,
        submitAnswer,
        showFeedback,
        nextQuestion,
        endGame,
        resetGame,
        getCurrentQuestion,
        getCurrentPlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
