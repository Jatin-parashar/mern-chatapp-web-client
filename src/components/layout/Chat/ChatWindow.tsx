import { useEffect, useLayoutEffect, useRef, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLazyGetMessagesByCursorQuery } from "../../../features/chat/chatApi";
import { setMessages } from "../../../features/chat/chatSlice";
import { useChat } from "../../../socket/hooks/useChat";
import { useTyping } from "../../../socket/hooks/useTyping";
import type { RootState } from "../../../app/store";
import type { Message } from "../../../types/entities";
import MessageBubble from "./MessageBubble";
import MessageInfoModal from "./MessageInfoModal";
import ChatInput from "./ChatInput";
import { ScrollArea } from "../../ui/scroll-area";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export default function ChatWindow() {
  const dispatch = useDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageInfo, setShowMessageInfo] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const isInitialLoadRef = useRef(true);
  const { activeConversation, messages } = useSelector((state: RootState) => state.chat);
  const currentUserId = useSelector((state: RootState) => state.user._id);
  const [getMessagesByCursor] = useLazyGetMessagesByCursorQuery();
  const { emitJoinRoom, emitConversationMessagesSeen } = useChat();
  const { typingStatus } = useTyping();

  const typingUsers = useMemo(() => 
    activeConversation && typingStatus[activeConversation._id]
      ? Object.keys(typingStatus[activeConversation._id]).filter(userId => userId !== currentUserId)
      : [],
    [activeConversation, typingStatus, currentUserId]
  );
  
  const isOtherUserTyping = typingUsers.length > 0;

  const groupedMessages = useMemo(() => {
    const groups: { [key: string]: typeof messages } = {};
    messages.forEach(msg => {
      const date = dayjs(msg.createdAt).format('YYYY-MM-DD');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  }, [messages]);

  const formatDateHeader = (date: string) => {
    const today = dayjs().format('YYYY-MM-DD');
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    
    if (date === today) return 'Today';
    if (date === yesterday) return 'Yesterday';
    return dayjs(date).format('MMMM D, YYYY');
  };

  const prevConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeConversation && activeConversation._id !== prevConversationIdRef.current) {
      prevConversationIdRef.current = activeConversation._id;
      isInitialLoadRef.current = true;
      dispatch(setMessages([]));
      setCursor(undefined);
      setHasMore(true);
      
      getMessagesByCursor({ id: activeConversation._id, limit: 50 }).then(async (result) => {
        if (result.data?.data) {
          const { messages: msgs, nextCursor } = result.data.data;
          if (msgs) {
            dispatch(setMessages(msgs));
            setCursor(nextCursor || undefined);
            setHasMore(!!nextCursor);
          
            const hasUnseenMessages = msgs.some((msg: any) => 
              msg.sender._id !== currentUserId && 
              !msg.seenBy.some((user: any) => {
                const userId = typeof user === 'string' ? user : user._id;
                return userId === currentUserId;
              })
            );
          
            if (hasUnseenMessages) {
              emitConversationMessagesSeen(activeConversation._id);
            }
          }
        }
      });
      emitJoinRoom(activeConversation._id);
    } else if (!activeConversation) {
      prevConversationIdRef.current = null;
      dispatch(setMessages([]));
    }
  }, [activeConversation?._id, getMessagesByCursor, dispatch, emitJoinRoom, currentUserId, emitConversationMessagesSeen]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentScrollTop = target.scrollTop;
    const isScrollingUp = currentScrollTop < lastScrollTopRef.current;
    
    lastScrollTopRef.current = currentScrollTop;
    
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    
    if (target.scrollTop === 0 && isScrollingUp && hasMore && !isLoadingMore && cursor) {
      setIsLoadingMore(true);
      const result = await getMessagesByCursor({ id: activeConversation!._id, cursor, limit: 50 });
      if (result.data?.data) {
        const { messages: olderMsgs, nextCursor } = result.data.data;
        if (olderMsgs) {
          dispatch(setMessages([...olderMsgs, ...messages]));
          setCursor(nextCursor || undefined);
          setHasMore(!!nextCursor);
        }
      }
      setIsLoadingMore(false);
    }
  };

  useLayoutEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages.length]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-accent/20">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
          <p className="text-sm text-muted-foreground">Choose a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-accent/10">
      <ScrollArea ref={scrollAreaRef} className="flex-1 h-0" onScrollCapture={handleScroll}>
        <div className="p-3 sm:p-4 min-h-full">
        {isLoadingMore && (
          <div className="flex justify-center py-3">
            <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        )}
        {messages.length > 0 ? (
        <>
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <span className="text-xs bg-accent px-3 py-1 rounded-full text-muted-foreground">
                  {formatDateHeader(date)}
                </span>
              </div>
              {msgs.map((message) => (
                <MessageBubble 
                  key={message._id} 
                  message={message}
                  allMessages={messages}
                  onShowInfo={(msg) => {
                    setSelectedMessage(msg);
                    setShowMessageInfo(true);
                  }}
                  onReply={(msg) => setReplyingTo(msg)}
                />
              ))}
            </div>
          ))}
          {isOtherUserTyping && (
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-muted rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          No messages yet. Start the conversation!
        </div>
      )}
        </div>
      </ScrollArea>
      <ChatInput replyingTo={replyingTo} onCancelReply={() => setReplyingTo(null)} />
      {showMessageInfo && (
        <MessageInfoModal
          message={selectedMessage}
          open={showMessageInfo}
          onOpenChange={setShowMessageInfo}
        />
      )}
    </div>
  );
}
