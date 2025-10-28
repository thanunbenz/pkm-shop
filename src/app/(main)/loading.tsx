export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-300 rounded w-1/2 mb-6"></div>
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
      </div>
    </main>
  );
}
