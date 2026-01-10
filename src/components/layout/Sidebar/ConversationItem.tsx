import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { formatDistanceToNow } from "../../../utils/formatting";
import type { Conversation } from "../../../types/entities";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { cn } from "../../../lib/utils";
import { memo } from "react";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const ConversationItem = memo(function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const currentUserId = useSelector((state: RootState) => state.user._id);
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);

  const otherParticipant = conversation.participants.find((p) => p._id !== currentUserId);
  const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant._id) : false;

  const displayName = conversation.isGroup
    ? (conversation.name || "Group")
    : (otherParticipant?.name || "Unknown");

  const avatarUrl = conversation.isGroup
    ? ""
    : otherParticipant?.profilePic;

  const lastMessage = conversation.lastMessage;
  
  const getLastMessageText = () => {
    if (!lastMessage) return "No messages yet";
    if (lastMessage.attachments && lastMessage.attachments.length > 0) {
      const attachment = lastMessage.attachments[0];
      if (attachment.mimeType?.startsWith('image/')) return "📷 Photo";
      if (attachment.mimeType?.startsWith('video/')) return "🎥 Video";
      if (attachment.mimeType?.startsWith('audio/')) return "🎵 Audio";
      return "📎 File";
    }
    return lastMessage.content || "Message";
  };
  
  const lastMessageText = getLastMessageText();
  const lastMessageTime = lastMessage?.createdAt
    ? formatDistanceToNow(new Date(lastMessage.createdAt))
    : "";
  
  const unseenMessages = conversation.lastMessage && 
    conversation.lastMessage.sender._id !== currentUserId &&
    !conversation.lastMessage.seenBy.some(user => {
      const userId = typeof user === 'string' ? user : user._id;
      return userId === currentUserId;
    });
  
  const unreadCount = unseenMessages ? 1 : 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 cursor-pointer transition-colors hover:bg-accent",
        isActive && "bg-accent"
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11 sm:h-12 sm:w-12">
          <AvatarImage src={avatarUrl || ""} alt={displayName} loading="lazy" />
          <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        {!conversation.isGroup && isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between mb-1">
          <h3 className={cn("font-semibold text-sm truncate", unreadCount > 0 && "text-foreground")}>
            {displayName}
          </h3>
          <div className="flex items-center gap-2">
            {lastMessageTime && (
              <span className={cn("text-xs", unreadCount > 0 ? "text-indigo-600 font-semibold" : "text-muted-foreground")}>
                {lastMessageTime}
              </span>
            )}
            {unreadCount > 0 && (
              <Badge variant="default" className="h-5 min-w-5 px-1.5 bg-indigo-600 hover:bg-indigo-600">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={cn("text-sm truncate", unreadCount > 0 ? "font-semibold text-foreground" : "text-muted-foreground")}>
            {lastMessageText}
          </p>
        </div>
      </div>
    </div>
  );
});

export default ConversationItem;
