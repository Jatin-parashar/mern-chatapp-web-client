import { Skeleton } from "../ui/skeleton";

export default function PageLoader() {
  return (
    <div className="h-screen w-screen flex">
      <div className="w-80 border-r border-border p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <Skeleton className="h-16 w-full" />
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-20 w-64 rounded-2xl" />
            </div>
          ))}
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}
