export const LoadingScreen = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-bg font-bengali">
    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-3xl text-white shadow-xl shadow-primary/30">🌉</div>
    <div className="relative h-10 w-10">
      <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
    </div>
    <p className="mt-4 text-sm font-medium text-text-muted">লোড হচ্ছে...</p>
  </div>
);

