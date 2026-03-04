import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSendMessageMutation } from "../../../features/chat/chatApi";
import { useTyping } from "../../../socket/hooks/useTyping";
import { addConversation } from "../../../features/chat/chatSlice";
import type { RootState } from "../../../app/store";
import type { Message } from "../../../types/entities";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Send, Plus, Smile, X, FileIcon, Image as ImageIcon, Video, Music, FileText } from "lucide-react";
import { showToast } from "../../../utils/toast";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { TIMING_CONFIG } from "../../../config/constants";
import { validateFile } from "../../../utils/sanitization";

interface ChatInputProps {
  replyingTo: Message | null;
  onCancelReply: () => void;
}

export default function ChatInput({ replyingTo, onCancelReply }: ChatInputProps) {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { activeConversation } = useSelector((state: RootState) => state.chat);
  const [sendMessage, { isLoading }] = useSendMessageMutation();
  // Server now handles socket emissions automatically via REST API
  const { emitTyping, emitStopTyping } = useTyping();
  const { theme } = useTheme();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevConversationRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  useEffect(() => {
    if (prevConversationRef.current && prevConversationRef.current !== activeConversation?._id) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setMessage("");
      setFiles([]);
    }
    prevConversationRef.current = activeConversation?._id || null;
  }, [activeConversation]);

  useEffect(() => {
    if (activeConversation && !isLoading && !uploading) {
      inputRef.current?.focus();
    }
  }, [activeConversation, isLoading, uploading, replyingTo]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of selectedFiles) {
      const validation = validateFile(file);
      if (!validation.valid) {
        showToast.error(validation.error || 'Invalid file');
      } else {
        validFiles.push(file);
      }
    }
    
    setFiles(prev => [...prev, ...validFiles]);
    setShowAttachMenu(false);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };



  const handleSend = async () => {
    if ((!message.trim() && files.length === 0) || !activeConversation || isLoading || uploading) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
      emitStopTyping(activeConversation._id);
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('conversationId', activeConversation._id);
      if (message.trim()) formData.append('content', message.trim());
      if (replyingTo) formData.append('replyTo', replyingTo._id);
      files.forEach(file => formData.append('files', file));

      // Server automatically emits socket event after successful message send
      const result = await sendMessage(formData as any).unwrap();
      
      if (result.data?.conversation) {
        dispatch(addConversation(result.data.conversation));
      }
      
      setMessage("");
      setFiles([]);
      onCancelReply();
    } catch (error: any) {
      if (error?.status !== 401) {
        showToast.error(error?.data?.message || "Failed to send message");
      }
    } finally {
      setUploading(false);
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  const handleTyping = () => {
    if (!activeConversation) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    } else {
      emitTyping(activeConversation._id);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (activeConversation) {
        emitStopTyping(activeConversation._id);
      }
      typingTimeoutRef.current = null;
    }, TIMING_CONFIG.TYPING_DELAY);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation) return null;

  return (
    <div className="border-t border-border bg-background">
      {replyingTo && (
        <div className="px-3 sm:px-4 py-2 bg-accent/50 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Replying to {replyingTo.sender.name}</p>
            <p className="text-sm truncate">{replyingTo.content || "Attachment"}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {files.length > 0 && (
        <div className="px-3 sm:px-4 py-2 flex gap-2 overflow-x-auto">
          {files.map((file, index) => (
            <div key={index} className="relative flex items-center gap-2 bg-accent rounded-lg p-2 min-w-fit">
              {file.type.startsWith('image/') ? (
                <ImageIcon className="h-4 w-4" />
              ) : (
                <FileIcon className="h-4 w-4" />
              )}
              <span className="text-xs truncate max-w-[100px]">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="h-14 sm:h-16 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2">
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={videoInputRef}
          type="file"
          multiple
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={audioInputRef}
          type="file"
          multiple
          accept="audio/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={documentInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <Popover open={showAttachMenu} onOpenChange={setShowAttachMenu}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 sm:h-10 sm:w-10">
              <Plus className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 sm:w-56 p-2" align="start" side="top">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                className="h-auto flex-col gap-1.5 sm:gap-2 py-2 sm:py-3"
                onClick={() => imageInputRef.current?.click()}
              >
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs">Photos</span>
              </Button>
              <Button
                variant="ghost"
                className="h-auto flex-col gap-1.5 sm:gap-2 py-2 sm:py-3"
                onClick={() => videoInputRef.current?.click()}
              >
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-pink-500 flex items-center justify-center">
                  <Video className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs">Videos</span>
              </Button>
              <Button
                variant="ghost"
                className="h-auto flex-col gap-1.5 sm:gap-2 py-2 sm:py-3"
                onClick={() => audioInputRef.current?.click()}
              >
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <Music className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs">Audio</span>
              </Button>
              <Button
                variant="ghost"
                className="h-auto flex-col gap-1.5 sm:gap-2 py-2 sm:py-3"
                onClick={() => documentInputRef.current?.click()}
              >
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs">Document</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyPress={handleKeyPress}
          disabled={isLoading || uploading}
          className="flex-1"
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 sm:h-10 sm:w-10">
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 border-none" align="end" side="top">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              theme={(theme === 'dark' ? 'dark' : 'light') as any}
              width="100%"
              height="clamp(280px, 50vh, 400px)"
            />
          </PopoverContent>
        </Popover>

        <Button
          onClick={handleSend}
          disabled={(!message.trim() && files.length === 0) || isLoading || uploading}
          size="icon"
          className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  );
}
