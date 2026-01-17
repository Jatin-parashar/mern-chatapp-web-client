import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Phone, Video, MoreVertical, ArrowLeft } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../app/store";
import { setActiveConversation } from "../../../features/chat/chatSlice";
import { useCall } from "../../../socket/hooks/useCall";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface ChatHeaderProps {
  onViewProfile?: (user: any) => void;
}

export default function ChatHeader({ onViewProfile }: ChatHeaderProps) {
  const dispatch = useDispatch();
  const { initiateCall } = useCall();
  const { activeConversation, onlineUsers } = useSelector((state: RootState) => state.chat);
  const currentUserId = useSelector((state: RootState) => state.user._id);

  if (!activeConversation) return null;

  const otherParticipant = activeConversation.participants.find((p) => p._id !== currentUserId);
  const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant._id) : false;

  const displayName = activeConversation.isGroup
    ? (activeConversation.name || "Group")
    : (otherParticipant?.name || "Unknown");

  const displayStatus = activeConversation.isGroup
    ? `${activeConversation.participants.length} members`
    : isOnline
    ? "Online"
    : "Offline";

  const avatarUrl = activeConversation.isGroup
    ? ""
    : otherParticipant?.profilePic;

  const handleBack = () => {
    dispatch(setActiveConversation(null as any));
  };

  const handleAudioCall = () => {
    if (otherParticipant && !activeConversation.isGroup) {
      initiateCall(otherParticipant._id, false);
    }
  };

  const handleVideoCall = () => {
    if (otherParticipant && !activeConversation.isGroup) {
      initiateCall(otherParticipant._id, true);
    }
  };

  const handleViewProfile = () => {
    if (onViewProfile && otherParticipant) {
      onViewProfile(otherParticipant);
    }
  };

  return (
    <div className="h-14 sm:h-16 border-b border-border px-3 sm:px-4 flex items-center justify-between bg-background">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="relative shrink-0">
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
            <AvatarImage src={avatarUrl || ""} alt={displayName} />
            <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          {!activeConversation.isGroup && isOnline && (
            <span className="absolute bottom-0 right-0 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-green-500 border-2 border-background rounded-full" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-sm truncate">{displayName}</h2>
          <p className="text-xs text-muted-foreground truncate">{displayStatus}</p>
        </div>
      </div>

      <TooltipProvider>
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10" onClick={handleAudioCall} disabled={!otherParticipant || activeConversation.isGroup}>
                <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voice Call</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10" onClick={handleVideoCall} disabled={!otherParticipant || activeConversation.isGroup}>
                <Video className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Video Call</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10">
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewProfile}>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete Chat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipProvider>
    </div>
  );
}
