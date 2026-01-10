import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { MessageSquare } from "lucide-react";
import type { User } from "../../../types/entities";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";

interface UserSearchItemProps {
  user: User;
  onStartChat: (userId: string) => void;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function UserSearchItem({ user, onStartChat }: UserSearchItemProps) {
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
  const isOnline = onlineUsers.includes(user._id);

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-accent transition-colors">
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.profilePic} alt={user.name} />
          <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{user.name}</h3>
        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
        {user.status && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{user.status}</p>
        )}
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onStartChat(user._id)}
        className="shrink-0"
      >
        <MessageSquare className="h-4 w-4" />
      </Button>
    </div>
  );
}
