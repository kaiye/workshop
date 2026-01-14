import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common';
import { OptionButton, Timer, type OptionState } from '../../components/game';
import { CorrectBanner, IncorrectBanner } from '../../components/feedback';
import { useGame } from '../../context/GameContext';

export function QuestionPage() {
  const navigate = useNavigate();
  const { state, submitAnswer, getCurrentQuestion, getCurrentPlayer } = useGame();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const question = getCurrentQuestion();
  const player = getCurrentPlayer();

  useEffect(() => {
    if (state.phase === 'finished') {
      navigate('/result');
    } else if (state.phase === 'feedback') {
      setShowResult(true);
    } else if (state.phase === 'question') {
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [state.phase, state.currentQuestionIndex, navigate]);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || showResult) return;

    setSelectedAnswer(index);
    submitAnswer(index);

    // Show result after a short delay
    setTimeout(() => {
      setShowResult(true);
    }, 500);
  };

  const getOptionState = (index: number): OptionState => {
    if (!showResult) {
      if (selectedAnswer === index) return 'selected';
      if (selectedAnswer !== null) return 'disabled';
      return 'default';
    }

    // Show results
    const correctAnswer = question?.correctAnswer;
    if (index === correctAnswer) return 'correct';
    if (index === selectedAnswer && selectedAnswer !== correctAnswer) return 'incorrect';
    return 'disabled';
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading question...</p>
      </div>
    );
  }

  const isCorrect = player?.isCorrect;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <Header
        leftContent={
          <button className="text-white hover:opacity-80 transition-opacity">
            <span className="material-icons-round text-2xl">volume_up</span>
          </button>
        }
        centerContent={
          <Timer
            totalSeconds={300}
            remainingSeconds={state.totalTimeRemaining}
            showBar={false}
          />
        }
        rightContent={
          <>
            <div className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded-lg">
              <span className="material-icons-round text-amber-400 text-xl">leaderboard</span>
              <span className="font-bold text-white">{player?.score || 0}</span>
            </div>
          </>
        }
      />

      {/* Feedback Banner */}
      {showResult && (
        isCorrect ? <CorrectBanner /> : <IncorrectBanner />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {/* Question */}
        <div className="p-6 pt-8">
          <div className="text-center mb-2">
            <span className="text-sm text-gray-500 font-semibold">
              Question {state.currentQuestionIndex + 1} of {state.questions.length}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-800 leading-tight text-center">
            {question.text}
          </h2>
        </div>

        {/* Options */}
        <div className="flex-1 px-6 pb-24">
          <div className="space-y-4">
            {question.options.map((option, index) => (
              <OptionButton
                key={index}
                option={option}
                index={index}
                state={getOptionState(index + 1)}
                onClick={() => handleAnswer(index + 1)}
                disabled={selectedAnswer !== null || showResult}
              />
            ))}
          </div>
        </div>

        {/* Bottom Action */}
        {showResult && (
          <div className="fixed bottom-0 left-0 w-full p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-30">
            <div className="max-w-md mx-auto">
              <p className="text-center text-gray-600 font-semibold">
                {isCorrect ? '+100 points!' : 'Better luck next time!'}
              </p>
              <p className="text-center text-gray-400 text-sm mt-1">
                Waiting for next question...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
