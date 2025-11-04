export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col gap-4">
        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
      </div>
      <hr className="border-gray-300 my-3 border" />
      <div className="h-10 bg-gray-300 rounded w-32 mb-4"></div>
      <div className="mt-8">
        <div className="flex flex-col mt-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
