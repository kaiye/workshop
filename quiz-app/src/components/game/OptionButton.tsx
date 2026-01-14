export type OptionState = 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled';

interface OptionButtonProps {
  option: string;
  index: number;
  state: OptionState;
  onClick: () => void;
  disabled?: boolean;
}

const stateStyles: Record<OptionState, string> = {
  default: 'bg-white text-gray-800 shadow-game border-2 border-gray-100 hover:scale-[1.02]',
  selected: 'bg-primary text-white shadow-game',
  correct: 'bg-game-green text-white ring-4 ring-green-300 shadow-glow-green scale-[1.02]',
  incorrect: 'bg-game-red text-white ring-4 ring-red-200 translate-y-[6px] shadow-none',
  disabled: 'bg-white text-gray-400 opacity-50 grayscale shadow-game border-2 border-gray-100',
};

const icons = ['category', 'bolt', 'star', 'favorite'];

export function OptionButton({
  option,
  index,
  state,
  onClick,
  disabled,
}: OptionButtonProps) {
  const isClickable = state === 'default' && !disabled;

  return (
    <button
      onClick={onClick}
      disabled={!isClickable}
      className={`
        w-full py-4 px-6 rounded-xl font-bold text-lg
        transition-all duration-200
        flex items-center justify-between
        ${stateStyles[state]}
        ${isClickable ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'}
      `}
    >
      <div
        className={`
          rounded-lg p-2 mr-4
          ${state === 'correct' ? 'bg-black/10' : ''}
          ${state === 'incorrect' ? 'bg-black/20' : ''}
          ${state === 'default' || state === 'disabled' ? 'bg-gray-100' : ''}
          ${state === 'selected' ? 'bg-white/20' : ''}
        `}
      >
        <span
          className={`
            material-icons-round text-xl
            ${state === 'correct' ? 'text-white' : ''}
            ${state === 'incorrect' ? 'text-white' : ''}
            ${state === 'default' || state === 'disabled' ? 'text-gray-400' : ''}
            ${state === 'selected' ? 'text-white' : ''}
          `}
        >
          {state === 'correct' ? 'check_circle' : state === 'incorrect' ? 'close' : icons[index]}
        </span>
      </div>
      <span className={`flex-1 text-center mr-8 ${state === 'correct' || state === 'incorrect' ? 'text-shadow' : ''}`}>
        {option}
      </span>
    </button>
  );
}
