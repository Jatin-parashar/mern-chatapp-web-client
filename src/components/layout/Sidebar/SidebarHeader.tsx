import { useState } from "react";
import { useSelector } from "react-redux";
import { UserPlus, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import type { RootState } from "../../../app/store";
import { Button } from "../../ui/button";
import { ModeToggle } from "../../theme/mode-toggle";
import GroupCreationModal from "./GroupCreationModal";
import { getInitials } from "../../../utils/helpers";

interface SidebarHeaderProps {
  onLogout: () => void;
  onProfileClick?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function SidebarHeader({ onLogout, onProfileClick, showBackButton, onBack }: SidebarHeaderProps) {
  const user = useSelector((state: RootState) => state.user);
  const [showGroupModal, setShowGroupModal] = useState(false);

  return (
    <div className="h-14 sm:h-16 p-4 border-b border-border">
      <div className="flex items-center justify-between">
        {showBackButton ? (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <h2 className="text-base sm:text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Elevate Messaging
          </h2>
        )}
        
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowGroupModal(true)}
                >
                  <UserPlus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create Group</p>
              </TooltipContent>
            </Tooltip>
            <ModeToggle />
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarImage src={user.profilePic} alt={user.name} />
                <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white text-sm">
                  {user.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onProfileClick}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
          </div>
        </TooltipProvider>
      </div>

      <GroupCreationModal open={showGroupModal} onOpenChange={setShowGroupModal} />
    </div>
  );
}
