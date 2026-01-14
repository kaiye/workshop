import type { ReactNode } from 'react';

interface HeaderProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  centerContent?: ReactNode;
}

export function Header({ leftContent, rightContent, centerContent }: HeaderProps) {
  return (
    <header className="relative z-20 w-full bg-primary h-14 flex items-center justify-between px-4 shadow-cartoon">
      <div className="flex items-center">
        {leftContent}
      </div>
      <div className="flex-1 flex justify-center">
        {centerContent}
      </div>
      <div className="flex items-center gap-2">
        {rightContent}
      </div>
    </header>
  );
}
