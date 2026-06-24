export const LoadingScreen = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-bg font-bengali">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-app bg-primary text-3xl text-white shadow-lg shadow-primary/30">🌉</div>
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-50 border-t-primary" />
    <p className="mt-3 text-sm text-text-secondary">লোড হচ্ছে...</p>
  </div>
);

