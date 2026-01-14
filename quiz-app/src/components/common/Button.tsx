import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'icon' | 'dark';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-white text-slate-800 hover:bg-slate-50',
  secondary: 'bg-primary text-white hover:bg-primary/90',
  icon: 'bg-transparent text-white hover:bg-white/20 p-2',
  dark: 'bg-gray-800 text-white hover:bg-gray-700',
};

export function Button({
  variant = 'primary',
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        relative rounded-xl font-bold text-lg
        shadow-cartoon active:shadow-cartoon-hover active:translate-y-[2px]
        transition-all duration-150
        flex items-center justify-center gap-2
        ${variant === 'icon' ? 'rounded-full' : 'px-6 py-3'}
        ${fullWidth ? 'w-full' : ''}
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
