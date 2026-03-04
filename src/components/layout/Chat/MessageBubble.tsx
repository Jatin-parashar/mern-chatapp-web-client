import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { formatMessageTime } from "../../../utils/formatting";
import type { Message } from "../../../types/entities";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { cn } from "../../../lib/utils";
import { Check, CheckCheck, Info, Reply } from "lucide-react";
import { memo, useMemo } from "react";
import { AttachmentRenderer } from "../../common/AttachmentRenderer";
import { getInitials } from "../../../utils/helpers";
import { Button } from "../../ui/button";

interface MessageBubbleProps {
  message: Message;
  onShowInfo?: (message: Message) => void;
  onReply?: (message: Message) => void;
  allMessages?: Message[];
}

const MessageBubble = memo(function MessageBubble({ message, onShowInfo, onReply, allMessages }: MessageBubbleProps) {
  const { currentUserId, activeConversation } = useSelector((state: RootState) => ({
    currentUserId: state.user._id,
    activeConversation: state.chat.activeConversation,
  }));

  const repliedMessage = useMemo(() => {
    if (!message.replyTo || !allMessages) return null;
    const replyId = typeof message.replyTo === 'string' ? message.replyTo : (message.replyTo as any)._id;
    return allMessages.find(m => m._id === replyId);
  }, [message.replyTo, allMessages]);

  const { isOwnMessage, isSeen, isDelivered, hasAttachments } = useMemo(() => {
    const isOwn = message.sender._id === currentUserId;
    
    if (!isOwn) {
      return { isOwnMessage: false, isSeen: false, isDelivered: false, hasAttachments: message.attachments && message.attachments.length > 0 };
    }
    
    const otherId = (u: string | { _id: string }) => typeof u === 'string' ? u : u._id;

    const otherParticipants = (activeConversation?.participants || [])
      .map(p => p._id)
      .filter(id => id !== currentUserId);

    const seenByOthers = (message.seenBy || []).map(otherId).filter(id => id !== currentUserId);
    const deliveredToOthers = (message.deliveredTo || []).map(otherId).filter(id => id !== currentUserId);

    // ALL other participants must have seen → blue ticks
    const seen = otherParticipants.length > 0 && otherParticipants.every(id => seenByOthers.includes(id));

    // ALL other participants must have received → grey double ticks (only if not fully seen)
    const delivered = !seen && otherParticipants.length > 0 && otherParticipants.every(id => deliveredToOthers.includes(id) || seenByOthers.includes(id));
    const hasAttach = message.attachments && message.attachments.length > 0;
    
    return { isOwnMessage: true, isSeen: seen, isDelivered: delivered, hasAttachments: hasAttach };
  }, [message, currentUserId, activeConversation]);

  return (
    <div className={cn("flex gap-1.5 sm:gap-2 mb-3 sm:mb-4", isOwnMessage && "flex-row-reverse")}>
      {!isOwnMessage && (
        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
          <AvatarImage src={message.sender.profilePic} alt={message.sender.name} loading="lazy" />
          <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white text-xs">
            {getInitials(message.sender.name)}
          </AvatarFallback>
        </Avatar>
      )}

      <div 
        className={cn("flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[70%] group", isOwnMessage && "items-end")}
      >
        {!isOwnMessage && (
          <span className="text-xs text-muted-foreground mb-1 px-1">
            {message.sender.name}
          </span>
        )}
        
        <div className="relative">
          {onShowInfo && (
            <div className={cn(
              "absolute -top-2 flex gap-1 z-10 transition-opacity",
              isOwnMessage ? "right-1" : "left-1",
              "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            )}>
              {onReply && (
                <Button
                  onClick={() => onReply(message)}
                  size="icon"
                  variant="secondary"
                  className="h-6 w-6 rounded-full shadow-md"
                >
                  <Reply className="h-3 w-3" />
                </Button>
              )}
              {isOwnMessage && (
                <Button
                  onClick={() => onShowInfo(message)}
                  size="icon"
                  variant="secondary"
                  className="h-6 w-6 rounded-full shadow-md"
                >
                  <Info className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          <div
            className={cn(
              "rounded-2xl px-3 py-2 sm:px-4 wrap-break-word",
              isOwnMessage
                ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white"
                : "bg-accent"
            )}
          >
            {repliedMessage && (
              <div className={cn(
                "mb-3 pl-3 pr-2.5 py-2 rounded-lg border-l-[3px] cursor-pointer hover:scale-[1.01] transition-transform",
                isOwnMessage 
                  ? "bg-white/15 border-white/50 backdrop-blur-sm" 
                  : "bg-linear-to-r from-primary/8 to-primary/5 border-primary/50"
              )}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Reply className={cn(
                    "h-3 w-3 shrink-0",
                    isOwnMessage ? "text-white/70" : "text-primary/70"
                  )} />
                  <p className={cn(
                    "text-xs font-bold tracking-tight",
                    isOwnMessage ? "text-white" : "text-primary"
                  )}>
                    {repliedMessage.sender._id === currentUserId ? 'You' : repliedMessage.sender.name}
                  </p>
                </div>
                
                {repliedMessage.attachments && repliedMessage.attachments.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px]">📎</span>
                    <span className={cn(
                      "text-[11px] font-medium",
                      isOwnMessage ? "text-white/75" : "text-muted-foreground"
                    )}>
                      {repliedMessage.attachments.length} attachment{repliedMessage.attachments.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                
                {repliedMessage.content && (
                  <p className={cn(
                    "text-xs line-clamp-2 break-words leading-relaxed",
                    isOwnMessage ? "text-white/80" : "text-foreground/75"
                  )}>
                    {repliedMessage.content}
                  </p>
                )}
                
                {!repliedMessage.content && (!repliedMessage.attachments || repliedMessage.attachments.length === 0) && (
                  <p className={cn(
                    "text-xs italic",
                    isOwnMessage ? "text-white/50" : "text-muted-foreground/50"
                  )}>
                    Original message
                  </p>
                )}
              </div>
            )}
            {hasAttachments && (
              <div className="space-y-2 mb-2">
                {message.attachments!.map((att, idx) => (
                  <AttachmentRenderer key={idx} attachment={att} />
                ))}
              </div>
            )}
            {message.content && <p className="text-sm break-words">{message.content}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1 mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(new Date(message.createdAt))}
          </span>
          {isOwnMessage && (
            <span className="text-xs">
              {isSeen ? (
                <CheckCheck className="h-3 w-3 text-blue-500" />
              ) : isDelivered ? (
                <CheckCheck className="h-3 w-3 text-gray-500" />
              ) : (
                <Check className="h-3 w-3 text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

export default MessageBubble;
