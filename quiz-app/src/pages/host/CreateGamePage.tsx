import { useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundPattern, Header, Button } from '../../components/common';
import { useGame } from '../../context/GameContext';
import { parseCSVFile, validateCSV } from '../../services/csvParser';
import { Question } from '../../types/game';

export function CreateGamePage() {
  const navigate = useNavigate();
  const { createGame } = useGame();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');
    setFileName(file.name);

    try {
      // Read file content for validation
      const content = await file.text();
      const validation = validateCSV(content);

      if (!validation.valid) {
        setError(validation.errors.join('\n'));
        setQuestions([]);
        setIsLoading(false);
        return;
      }

      // Parse the file
      const parsedQuestions = await parseCSVFile(file);
      setQuestions(parsedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCreateGame = () => {
    if (questions.length === 0) {
      setError('Please upload a valid CSV file first');
      return;
    }

    createGame(questions);
    navigate('/host/lobby');
  };

  return (
    <div className="bg-secondary min-h-screen flex flex-col font-body">
      <BackgroundPattern />

      <Header
        leftContent={
          <button
            onClick={() => navigate('/')}
            className="text-white hover:opacity-80 transition-opacity p-2"
          >
            <span className="material-icons-round text-2xl">arrow_back</span>
          </button>
        }
        centerContent={
          <span className="text-white font-display text-xl">Create Game</span>
        }
      />

      <main className="relative z-10 flex-1 flex flex-col items-center p-6 w-full max-w-2xl mx-auto">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.2)]">
            Upload Questions
          </h1>
          <p className="mt-2 text-white/80 font-semibold">
            Upload a CSV file with your quiz questions
          </p>
        </div>

        {/* Upload Area */}
        <div
          onClick={handleUploadClick}
          className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-cartoon cursor-pointer hover:bg-white transition-colors mb-6"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="material-icons-round text-4xl text-primary">
                {isLoading ? 'hourglass_empty' : fileName ? 'check_circle' : 'upload_file'}
              </span>
            </div>

            {fileName ? (
              <div className="text-center">
                <p className="font-bold text-lg text-gray-800">{fileName}</p>
                <p className="text-primary font-semibold">
                  {questions.length} questions loaded
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="font-bold text-lg text-gray-800">
                  Click to upload CSV
                </p>
                <p className="text-gray-500 text-sm">
                  or drag and drop your file here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="w-full bg-game-red/10 border-2 border-game-red rounded-xl p-4 mb-6">
            <p className="text-game-red font-semibold whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* Questions Preview */}
        {questions.length > 0 && (
          <div className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-cartoon mb-6 max-h-80 overflow-y-auto">
            <h2 className="font-display text-xl text-gray-800 mb-4">
              Preview ({questions.length} questions)
            </h2>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{q.text}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {q.options.map((opt, optIndex) => (
                          <span
                            key={optIndex}
                            className={`text-xs px-2 py-1 rounded-lg ${
                              optIndex + 1 === q.correctAnswer
                                ? 'bg-game-green/20 text-game-green font-bold'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                      {q.timeLimit && (
                        <p className="mt-1 text-xs text-gray-400">
                          Time limit: {q.timeLimit}s
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Game Button */}
        <Button
          variant="dark"
          fullWidth
          onClick={handleCreateGame}
          disabled={questions.length === 0 || isLoading}
        >
          <span>Create Game</span>
          <span className="material-icons-round">arrow_forward</span>
        </Button>
      </main>
    </div>
  );
}
