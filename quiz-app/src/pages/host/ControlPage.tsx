import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundPattern, Header, Button } from '../../components/common';
import { Timer, OptionButton } from '../../components/game';
import type { OptionState } from '../../components/game';
import { useGame } from '../../context/GameContext';

export function ControlPage() {
  const navigate = useNavigate();
  const { state, getCurrentQuestion, nextQuestion, endGame, showFeedback } = useGame();
  const { phase, players, currentQuestionIndex, questions, totalTimeRemaining, gameId } = state;

  const currentQuestion = getCurrentQuestion();

  // Redirect if no game or not host
  useEffect(() => {
    if (!gameId || !state.isHost) {
      navigate('/host/create');
    }
  }, [gameId, state.isHost, navigate]);

  // Navigate to final results when game ends
  useEffect(() => {
    if (phase === 'finished') {
      navigate('/host/final');
    }
  }, [phase, navigate]);

  // Calculate answer statistics
  const answerStats = useMemo(() => {
    const totalPlayers = players.length;
    const answeredPlayers = players.filter((p) => p.currentAnswer !== null).length;

    // Count answers per option
    const optionCounts: Record<number, number> = {};
    players.forEach((p) => {
      if (p.currentAnswer !== null) {
        optionCounts[p.currentAnswer] = (optionCounts[p.currentAnswer] || 0) + 1;
      }
    });

    return {
      totalPlayers,
      answeredPlayers,
      optionCounts,
    };
  }, [players]);

  const handleNextQuestion = () => {
    if (phase === 'question') {
      // First show feedback
      showFeedback();
    } else if (phase === 'feedback') {
      // Then go to next question
      nextQuestion();
    }
  };

  const handleEndGame = () => {
    endGame();
  };

  const getOptionState = (optionIndex: number): OptionState => {
    if (phase === 'feedback' && currentQuestion) {
      if (optionIndex + 1 === currentQuestion.correctAnswer) {
        return 'correct';
      }
      return 'disabled';
    }
    return 'default';
  };

  const isLastQuestion = currentQuestionIndex >= questions.length - 1;

  return (
    <div className="bg-secondary min-h-screen flex flex-col font-body">
      <BackgroundPattern />

      <Header
        leftContent={
          <div className="flex items-center gap-2 text-white">
            <span className="font-bold">PIN: {gameId}</span>
          </div>
        }
        centerContent={
          <Timer
            totalSeconds={300}
            remainingSeconds={totalTimeRemaining}
            showBar={false}
          />
        }
        rightContent={
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="material-icons-round">people</span>
            <span>{players.length}</span>
          </div>
        }
      />

      <main className="relative z-10 flex-1 flex flex-col p-6 w-full max-w-4xl mx-auto">
        {/* Question Progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 rounded-full px-4 py-2">
            <span className="text-white font-bold">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {phase === 'feedback' && (
              <span className="bg-accent text-gray-800 px-3 py-1 rounded-full font-bold animate-pulse">
                Showing Answer
              </span>
            )}
          </div>
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-cartoon mb-6">
            <h2 className="font-display text-2xl md:text-3xl text-gray-800 text-center mb-6">
              {currentQuestion.text}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <OptionButton
                  key={index}
                  option={option}
                  index={index}
                  state={getOptionState(index)}
                  onClick={() => {}}
                  disabled
                />
              ))}
            </div>
          </div>
        )}

        {/* Answer Statistics */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-cartoon mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-gray-800">
              Answer Statistics
            </h3>
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-primary">
                check_circle
              </span>
              <span className="font-bold text-gray-800">
                {answerStats.answeredPlayers} / {answerStats.totalPlayers} answered
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-primary transition-all duration-500 rounded-full"
              style={{
                width: `${
                  answerStats.totalPlayers > 0
                    ? (answerStats.answeredPlayers / answerStats.totalPlayers) * 100
                    : 0
                }%`,
              }}
            />
          </div>

          {/* Option breakdown */}
          {phase === 'feedback' && currentQuestion && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {currentQuestion.options.map((option, index) => {
                const count = answerStats.optionCounts[index + 1] || 0;
                const isCorrect = index + 1 === currentQuestion.correctAnswer;
                const percentage =
                  answerStats.answeredPlayers > 0
                    ? Math.round((count / answerStats.answeredPlayers) * 100)
                    : 0;

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-xl text-center ${
                      isCorrect
                        ? 'bg-game-green/20 border-2 border-game-green'
                        : 'bg-gray-100'
                    }`}
                  >
                    <p className="font-bold text-2xl text-gray-800">{count}</p>
                    <p className="text-sm text-gray-500">{percentage}%</p>
                    <p
                      className={`text-xs truncate mt-1 ${
                        isCorrect ? 'text-game-green font-bold' : 'text-gray-400'
                      }`}
                    >
                      {option}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {players.length === 0 && (
            <p className="text-gray-400 text-center text-sm">
              No players have joined yet
            </p>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          <Button
            variant="dark"
            fullWidth
            onClick={handleNextQuestion}
            className="text-lg py-4"
          >
            <span className="material-icons-round">
              {phase === 'question'
                ? 'visibility'
                : isLastQuestion
                ? 'emoji_events'
                : 'arrow_forward'}
            </span>
            <span>
              {phase === 'question'
                ? 'Show Answer'
                : isLastQuestion
                ? 'See Results'
                : 'Next Question'}
            </span>
          </Button>

          <Button
            variant="primary"
            onClick={handleEndGame}
            className="px-6"
          >
            <span className="material-icons-round text-game-red">stop</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
