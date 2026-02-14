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
}

const MessageBubble = memo(function MessageBubble({ message, onShowInfo, onReply }: MessageBubbleProps) {
  const currentUserId = useSelector((state: RootState) => state.user._id);

  const { isOwnMessage, isSeen, isDelivered, hasAttachments } = useMemo(() => {
    const isOwn = message.sender._id === currentUserId;
    
    if (!isOwn) {
      return { isOwnMessage: false, isSeen: false, isDelivered: false, hasAttachments: message.attachments && message.attachments.length > 0 };
    }
    
    const deliveredToOthers = (message.deliveredTo || []).filter(user => {
      const userId = typeof user === 'string' ? user : user._id;
      return userId !== currentUserId;
    });
    
    const seenByOthers = (message.seenBy || []).filter(user => {
      const userId = typeof user === 'string' ? user : user._id;
      return userId !== currentUserId;
    });
    
    const seen = seenByOthers.length > 0;
    const delivered = deliveredToOthers.length > 0 && !seen;
    const hasAttach = message.attachments && message.attachments.length > 0;
    
    return { isOwnMessage: true, isSeen: seen, isDelivered: delivered, hasAttachments: hasAttach };
  }, [message, currentUserId]);





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
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
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
            {message.replyTo && (
              <div className="mb-2 pb-2 border-b border-white/20">
                <p className="text-xs opacity-70">Replying to message</p>
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
