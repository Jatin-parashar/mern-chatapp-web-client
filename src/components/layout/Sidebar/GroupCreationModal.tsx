import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../app/store";
import { addConversation } from "../../../features/chat/chatSlice";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useSearchUsersByKeywordQuery } from "../../../features/user/userApi";
import { useCreateConversationMutation } from "../../../features/chat/chatApi";
// Server now handles socket emissions automatically via REST API
import { showToast } from "../../../utils/toast";
import { Loader2, X, Check } from "lucide-react";
import { getInitials } from "../../../utils/helpers";

interface GroupCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function GroupCreationModal({ open, onOpenChange }: GroupCreationModalProps) {
  const currentUserId = useSelector((state: RootState) => state.user._id);
  const dispatch = useDispatch();
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
        dispatch(addConversation(result.data.conversation));
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
          <div className="space-y-1.5">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="search">Add Members</Label>
            <Input
              id="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-border bg-accent/30">
              {selectedUsers.map(user => (
                <div key={user._id} className="flex items-center gap-1.5 bg-background border border-border rounded-full pl-1 pr-2 py-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.profilePic} />
                    <AvatarFallback className="text-[10px] bg-linear-to-br from-indigo-500 to-purple-600 text-white">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{user.name}</span>
                  <button
                    onClick={() => toggleUser(user)}
                    className="text-muted-foreground hover:text-foreground transition-colors ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-lg border border-border overflow-hidden">
            {searching ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : searchResults?.data?.data?.length ? (
              <div className="max-h-52 overflow-y-auto divide-y divide-border">
                {searchResults.data.data.map((user: any) => {
                  const isSelected = !!selectedUsers.find(u => u._id === user._id);
                  return (
                    <div
                      key={user._id}
                      onClick={() => toggleUser(user)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent cursor-pointer transition-colors"
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarImage src={user.profilePic} />
                        <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white text-xs">{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-border'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : searchQuery.length >= 2 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No users found</p>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Type to search users</p>
            )}
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
