import { Skeleton } from "./skeleton";

export const ConversationSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
);

export const UserSearchSkeleton = () => (
  <div className="flex items-center gap-3">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </div>
  </div>
);

