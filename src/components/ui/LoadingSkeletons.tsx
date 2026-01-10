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

export const MessageSkeleton = ({ isReverse }: { isReverse: boolean }) => (
  <div className={`flex gap-2 ${isReverse ? 'flex-row-reverse' : ''}`}>
    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
    <div className="flex flex-col gap-2 max-w-[70%]">
      <Skeleton className="h-20 w-64 rounded-2xl" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);
