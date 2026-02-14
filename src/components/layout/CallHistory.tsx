import { useGetCallHistoryQuery } from "../../features/call/callApi";
import { Card } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Phone, Video, PhoneMissed, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { getInitials } from "../../utils/helpers";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import moment from "moment";

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
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const calls = data?.data?.data || [];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Call History</h2>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {calls.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No call history</p>
            </div>
          ) : (
            calls.map((call: any) => {
              const otherUser = getOtherUser(call);
              return (
                <Card key={call._id} className="p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={otherUser.profilePic} alt={otherUser.name} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        {getInitials(otherUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getCallIcon(call)}
                        <p className="font-medium truncate">{otherUser.name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{moment(call.createdAt).fromNow()}</span>
                        {call.status === 'ended' && call.duration > 0 && (
                          <>
                            <span>•</span>
                            <span>{formatDuration(call.duration)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground capitalize">
                      {call.status}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
