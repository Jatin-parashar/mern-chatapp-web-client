import { useGetCallHistoryQuery } from "../../features/call/callApi";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Phone, Video, PhoneMissed, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { getInitials } from "../../utils/helpers";
import { Skeleton } from "../ui/skeleton";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function CallHistory() {
  const { data, isLoading } = useGetCallHistoryQuery();
  const currentUserId = useSelector((state: RootState) => state.user._id);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallIcon = (call: any) => {
    const isIncoming = call.receiver._id === currentUserId;
    
    if (call.status === 'missed') {
      return <PhoneMissed className="h-5 w-5 text-red-500" />;
    }
    if (call.isVideoCall) {
      return isIncoming ? <Video className="h-5 w-5 text-green-500" /> : <Video className="h-5 w-5 text-blue-500" />;
    }
    if (isIncoming) {
      return <PhoneIncoming className="h-5 w-5 text-green-500" />;
    }
    return <PhoneOutgoing className="h-5 w-5 text-blue-500" />;
  };

  const getOtherUser = (call: any) => {
    return call.caller._id === currentUserId ? call.receiver : call.caller;
  };

  if (isLoading) {
    return (
      <div className="p-3 space-y-2">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const calls = data?.data?.data || [];

  return (
    <div>
      <div className="p-4 border-b border-border">
        <h2 className="text-base font-semibold">Call History</h2>
      </div>
      <div className="p-3 space-y-2">
          {calls.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Phone className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No call history</p>
            </div>
          ) : (
            calls.map((call: any) => {
              const otherUser = getOtherUser(call);
              return (
                <Card key={call._id} className="p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={otherUser.profilePic} alt={otherUser.name} />
                      <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white text-sm">
                        {getInitials(otherUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {getCallIcon(call)}
                        <p className="font-medium text-sm truncate">{otherUser.name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{dayjs(call.createdAt).fromNow()}</span>
                        {call.status === 'ended' && call.duration > 0 && (
                          <>
                            <span>·</span>
                            <span>{formatDuration(call.duration)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize shrink-0">
                      {call.status}
                    </span>
                  </div>
                </Card>
              );
            })
          )}
      </div>
    </div>
  );
}
