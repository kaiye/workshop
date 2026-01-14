export function CorrectBanner() {
  return (
    <div className="bg-game-green w-full py-3 shadow-md border-b-4 border-green-600">
      <div className="flex items-center justify-center gap-2 text-white font-black text-2xl uppercase tracking-wider text-shadow">
        <span className="material-icons-round text-3xl">check_circle</span>
        <span>Correct!</span>
      </div>
    </div>
  );
}
