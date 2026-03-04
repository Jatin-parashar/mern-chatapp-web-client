import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Check, CheckCheck } from "lucide-react";
import type { Message } from "../../../types/entities";
import { formatMessageTime } from "../../../utils/formatting";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { getInitials } from "../../../utils/helpers";

interface MessageInfoModalProps {
  message: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MessageInfoModal({ message, open, onOpenChange }: MessageInfoModalProps) {
  const messages = useSelector((state: RootState) => state.chat.messages);
  const activeConversation = useSelector((state: RootState) => state.chat.activeConversation);
  const latestMessage = messages.find(m => m._id === message?._id) || message;
  
  if (!latestMessage) return null;

  const isGroup = activeConversation?.isGroup || false;

  // All other participants (everyone the message was sent to)
  const allRecipients = (activeConversation?.participants || [])
    .filter(p => p._id !== latestMessage.sender._id);

  const seenByUsers = latestMessage.seenBy
    ?.map(user => typeof user === 'string' ? allRecipients.find(p => p._id === user) ?? null : user)
    .filter((user): user is NonNullable<typeof user> => !!user && user._id !== latestMessage.sender._id) || [];

  const seenIds = new Set(seenByUsers.map(u => u._id));

  const deliveredIds = new Set(
    (latestMessage.deliveredTo || []).map(u => typeof u === 'string' ? u : u._id)
  );

  const deliveredToUsers = allRecipients
    .filter(p => deliveredIds.has(p._id) && !seenIds.has(p._id));

  const UserRow = ({ user }: { user: any }) => (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.profilePic} />
        <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white text-xs">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm font-medium">{user.name}</p>
        <p className="text-xs text-muted-foreground">@{user.username}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message Info</DialogTitle>
          <DialogDescription>View delivery and read status</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5" />
            <span>Sent {formatMessageTime(new Date(latestMessage.createdAt))}</span>
          </div>

          {!isGroup ? (
            // 1:1: show the other person with their status
            <div className="space-y-2">
              {allRecipients.map(user => (
                <div key={user._id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePic} />
                    <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                  {seenIds.has(user._id) ? (
                    <CheckCheck className="h-4 w-4 text-blue-500 shrink-0" />
                  ) : deliveredIds.has(user._id) ? (
                    <CheckCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <Check className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Tabs defaultValue="delivered" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="delivered">Delivered ({deliveredToUsers.length})</TabsTrigger>
                <TabsTrigger value="seen">Seen ({seenByUsers.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="delivered" className="mt-4">
                {deliveredToUsers.length > 0 ? (
                  <div className="space-y-2">
                    {deliveredToUsers.map((user: any) => <UserRow key={user._id} user={user} />)}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not delivered to anyone yet</p>
                )}
              </TabsContent>
              
              <TabsContent value="seen" className="mt-4">
                {seenByUsers.length > 0 ? (
                  <div className="space-y-2">
                    {seenByUsers.map((user: any) => <UserRow key={user._id} user={user} />)}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not seen yet</p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
