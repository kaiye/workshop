export function IncorrectBanner() {
  return (
    <div className="bg-game-red w-full py-3 shadow-md border-b-4 border-game-dark-red">
      <div className="flex items-center justify-center gap-2 text-white font-black text-2xl uppercase tracking-wider text-shadow">
        <span className="material-icons-round text-3xl">cancel</span>
        <span>Incorrect</span>
      </div>
    </div>
  );
}
