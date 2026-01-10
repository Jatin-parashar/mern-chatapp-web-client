import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useSearchUsersByKeywordQuery } from "../../../features/user/userApi";
import { useCreateConversationMutation } from "../../../features/chat/chatApi";
// Server now handles socket emissions automatically via REST API
import { showToast } from "../../../utils/toast";
import { Loader2, X } from "lucide-react";

interface GroupCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getInitials = (name: string) => {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
};

export default function GroupCreationModal({ open, onOpenChange }: GroupCreationModalProps) {
  const currentUserId = useSelector((state: RootState) => state.user._id);
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  
  const { data: searchResults, isLoading: searching } = useSearchUsersByKeywordQuery(
    { keyword: searchQuery },
    { skip: searchQuery.length < 2 }
  );
  
  const [createConversation, { isLoading: creating }] = useCreateConversationMutation();
  // Server automatically emits socket event after successful conversation creation

  const toggleUser = (user: any) => {
    setSelectedUsers(prev =>
      prev.find(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUsers.length < 2) {
      showToast.error("Group name and at least 2 members required");
      return;
    }

    try {
      const result = await createConversation({
        participants: [currentUserId, ...selectedUsers.map(u => u._id)],
        name: groupName.trim(),
        isGroup: true,
      }).unwrap();

      if (result.data?.conversation) {
        // Server automatically emits socket event after successful creation
        showToast.success("Group created successfully");
        onOpenChange(false);
        setGroupName("");
        setSelectedUsers([]);
        setSearchQuery("");
      }
    } catch (error: any) {
      showToast.error(error?.data?.message || "Failed to create group");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <div key={user._id} className="flex items-center gap-1 bg-accent rounded-full pl-1 pr-2 py-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.profilePic} />
                    <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{user.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0"
                    onClick={() => toggleUser(user)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div>
            <Label htmlFor="search">Add Members</Label>
            <Input
              id="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {searching && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {searchResults?.data?.data?.map((user: any) => (
              <div
                key={user._id}
                onClick={() => toggleUser(user)}
                className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg cursor-pointer"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profilePic} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
                {selectedUsers.find(u => u._id === user._id) && (
                  <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleCreate}
            disabled={creating || !groupName.trim() || selectedUsers.length < 2}
            className="w-full"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
