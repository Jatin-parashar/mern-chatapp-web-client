import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Check, CheckCheck } from "lucide-react";
import type { Message } from "../../../types/entities";
import { formatMessageTime } from "../../../utils/formatting";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";

interface MessageInfoModalProps {
  message: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getInitials = (name: string): string => {
  return name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
};

export default function MessageInfoModal({ message, open, onOpenChange }: MessageInfoModalProps) {
  const messages = useSelector((state: RootState) => state.chat.messages);
  const activeConversation = useSelector((state: RootState) => state.chat.activeConversation);
  const latestMessage = messages.find(m => m._id === message?._id) || message;
  
  if (!latestMessage) return null;

  const isGroup = activeConversation?.isGroup || false;

  const deliveredToUsers = latestMessage.deliveredTo
    ?.map(user => typeof user === 'string' ? null : user)
    .filter(user => user && user._id !== latestMessage.sender._id) || [];

  const seenByUsers = latestMessage.seenBy
    ?.map(user => typeof user === 'string' ? null : user)
    .filter(user => user && user._id !== latestMessage.sender._id) || [];

  const isDelivered = deliveredToUsers.length > 0 || latestMessage.deliveredTo?.some(u => typeof u === 'string');
  const isRead = seenByUsers.length > 0 || latestMessage.seenBy?.some(u => typeof u === 'string');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Message Info</DialogTitle>
          <DialogDescription>View delivery and read status</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {!isGroup ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Sent</span>
                <span className="ml-auto">{formatMessageTime(new Date(latestMessage.createdAt))}</span>
              </div>

              {isDelivered && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="ml-auto">{formatMessageTime(new Date(latestMessage.createdAt))}</span>
                </div>
              )}

              {isRead && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Read</span>
                  <span className="ml-auto">{formatMessageTime(new Date(latestMessage.updatedAt))}</span>
                </div>
              )}
            </div>
          ) : (
            <Tabs defaultValue="seen" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="seen">Seen</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sent" className="mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Sent at</span>
                  <span className="ml-auto">{formatMessageTime(new Date(latestMessage.createdAt))}</span>
                </div>
              </TabsContent>
              
              <TabsContent value="delivered" className="mt-4">
                {deliveredToUsers.length > 0 ? (
                  <div className="space-y-2">
                    {deliveredToUsers.map((user: any) => (
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not delivered yet</p>
                )}
              </TabsContent>
              
              <TabsContent value="seen" className="mt-4">
                {seenByUsers.length > 0 ? (
                  <div className="space-y-2">
                    {seenByUsers.map((user: any) => (
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
                      </div>
                    ))}
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
