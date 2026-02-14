import { usePresence } from "../../../socket/hooks/usePresence";
import { useChat } from "../../../socket/hooks/useChat";
import { useTyping } from "../../../socket/hooks/useTyping";
import { useCall } from "../../../socket/hooks/useCall";
import ChatHeader from "./ChatHeader";
import ChatWindow from "./ChatWindow";

interface ChatProps {
  onViewProfile?: (user: any) => void;
}

export default function Chat({ onViewProfile }: ChatProps) {
  // Initialize all socket hooks
  usePresence();
  useChat();
  useTyping();
  useCall();

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      <ChatHeader onViewProfile={onViewProfile} />
      <ChatWindow />
    </div>
  );
}
