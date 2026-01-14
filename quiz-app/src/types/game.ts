export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number; // 1-based index
  timeLimit?: number;
}

export interface Player {
  id: string;
  nickname: string;
  score: number;
  currentAnswer: number | null;
  isCorrect: boolean | null;
  joinedAt: number;
}

export type GamePhase =
  | 'idle'
  | 'waiting'
  | 'countdown'
  | 'question'
  | 'feedback'
  | 'finished';

export interface GameState {
  gameId: string | null;
  phase: GamePhase;
  questions: Question[];
  currentQuestionIndex: number;
  players: Player[];
  currentPlayerId: string | null;
  totalTimeRemaining: number;
  isHost: boolean;
}

export type GameAction =
  | { type: 'CREATE_GAME'; gameId: string; questions: Question[] }
  | { type: 'JOIN_GAME'; gameId: string }
  | { type: 'SET_PLAYER'; playerId: string; nickname: string }
  | { type: 'ADD_PLAYER'; player: Player }
  | { type: 'START_GAME' }
  | { type: 'START_COUNTDOWN' }
  | { type: 'START_QUESTION' }
  | { type: 'SUBMIT_ANSWER'; playerId: string; answer: number }
  | { type: 'SHOW_FEEDBACK' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'END_GAME' }
  | { type: 'TICK_TIMER' }
  | { type: 'SYNC_STATE'; state: GameState }
  | { type: 'RESET' };

export const INITIAL_GAME_STATE: GameState = {
  gameId: null,
  phase: 'idle',
  questions: [],
  currentQuestionIndex: 0,
  players: [],
  currentPlayerId: null,
  totalTimeRemaining: 300, // 5 minutes
  isHost: false,
};
