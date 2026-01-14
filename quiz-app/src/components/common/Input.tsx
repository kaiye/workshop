import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`
            w-full h-16 px-6 rounded-xl border-none
            text-center font-display text-2xl text-slate-700
            placeholder-slate-400 bg-white
            shadow-cartoon
            focus:ring-4 focus:ring-accent focus:outline-none
            transition-all transform focus:-translate-y-1
            ${error ? 'ring-2 ring-game-red' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-center text-game-red font-semibold text-sm">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
