export function BackgroundPattern() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 bg-pattern opacity-30" />

      {/* Floating shapes */}
      <div className="absolute top-1/4 left-10 w-16 h-16 bg-white/20 rounded-xl transform rotate-12 animate-float backdrop-blur-sm" />
      <div className="absolute bottom-1/4 right-10 w-20 h-20 bg-white/20 rounded-full animate-float-delayed backdrop-blur-sm" />
      <div className="absolute top-10 right-20 w-12 h-12 bg-white/10 rounded-lg transform -rotate-12 animate-float backdrop-blur-sm" />
      <div className="absolute bottom-10 left-20 w-14 h-14 bg-white/10 rounded-lg transform rotate-45 animate-float-delayed backdrop-blur-sm" />
    </div>
  );
}
