import { useDispatch, useSelector } from "react-redux";
import { useRef, useState } from "react";
import { setActiveConversation } from "../../../features/chat/chatSlice";
import { useCreateConversationMutation } from "../../../features/chat/chatApi";
import type { RootState } from "../../../app/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import SidebarHeader from "./SidebarHeader";
import SearchBar from "./SearchBar";
import ConversationItem from "./ConversationItem";
import UserSearchItem from "./UserSearchItem";
import { showToast } from "../../../utils/toast";
import { MessageSquare } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";
import { ConversationSkeleton, UserSearchSkeleton } from "../../ui/LoadingSkeletons";
import { useLogout } from "../../../hooks/useLogout";
import { useConversations } from "../../../hooks/useConversations";
import { useUserSearch } from "../../../hooks/useUserSearch";
import { EmptyState } from "../../common/EmptyState";

interface SidebarProps {
  profileUser?: any;
  onCloseProfile?: () => void;
}

export default function Sidebar({ profileUser, onCloseProfile }: SidebarProps) {
  const dispatch = useDispatch();
  const activeConversation = useSelector((state: RootState) => state.chat.activeConversation);
  const currentUserId = useSelector((state: RootState) => state.user._id);
  const currentUser = useSelector((state: RootState) => state.user);
  const allConversations = useSelector((state: RootState) => state.chat.conversations);
  const creatingConversationWith = useRef<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("chats");
  const [showOwnProfile, setShowOwnProfile] = useState(false);

  const showProfile = showOwnProfile || !!profileUser;
  const displayUser = profileUser || currentUser;

  const handleLogout = useLogout();
  
  const handleCloseProfile = () => {
    setShowOwnProfile(false);
    if (onCloseProfile) onCloseProfile();
  };

  const { conversations, isLoading: loadingConversations, refetch } = useConversations();
  const { query, setQuery, clearSearch, users, isSearching, isLoading: searchingUsers } = useUserSearch();
  const [createConversation] = useCreateConversationMutation();

  const handleConversationClick = (conversationId: string) => {
    const conversation = Object.values(allConversations).find((c) => c._id === conversationId);
    if (conversation) {
      dispatch(setActiveConversation(conversation));
      clearSearch();
    }
  };

  const handleStartChat = async (userId: string) => {
    if (creatingConversationWith.current.has(userId)) return;

    try {
      const existingConv = Object.values(allConversations).find(conv => 
        !conv.isGroup && conv.participants.some(p => p._id === userId)
      );

      if (existingConv) {
        dispatch(setActiveConversation(existingConv));
        clearSearch();
        return;
      }

      creatingConversationWith.current.add(userId);

      console.log('Creating conversation with:', { currentUserId, userId, participants: [currentUserId, userId] });

      const result = await createConversation({
        participants: [currentUserId, userId],
        isGroup: false,
      }).unwrap();

      if (result.data?.conversation) {
        dispatch(setActiveConversation(result.data.conversation));
        clearSearch();
        setActiveTab("chats");
        await refetch();
      }
    } catch (error: any) {
      showToast.error(error?.data?.message || "Failed to start chat");
    } finally {
      creatingConversationWith.current.delete(userId);
    }
  };

  return (
    <aside className="w-full bg-background border-r border-border flex flex-col h-full overflow-hidden">
      <SidebarHeader 
        onLogout={handleLogout} 
        onProfileClick={() => setShowOwnProfile(true)}
        showBackButton={showProfile}
        onBack={handleCloseProfile}
      />

      {showProfile ? (
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  <AvatarImage src={displayUser.profilePic} />
                  <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white text-xl sm:text-2xl">
                    {displayUser.name?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold">{displayUser.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">@{displayUser.username}</p>
              </div>
              
              <div className="space-y-4">
                {displayUser.email && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm">{displayUser.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="text-sm">{displayUser.status}</p>
                </div>
              </div>
              
              {displayUser._id === currentUserId && (
                <Button variant="outline" className="w-full">Edit Profile</Button>
              )}
            </div>
          </ScrollArea>
        </div>
      ) : (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chats" className="text-xs sm:text-sm">Chats</TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chats" className="flex-1 overflow-hidden mt-0">
          <div className="h-full overflow-hidden">
            <ScrollArea className="h-full">
              {loadingConversations ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <ConversationSkeleton key={i} />
                  ))}
                </div>
              ) : conversations.length > 0 ? (
                <div>
                  {conversations.map((conversation) => (
                    <ConversationItem
                      key={conversation._id}
                      conversation={conversation}
                      isActive={activeConversation?._id === conversation._id}
                      onClick={() => handleConversationClick(conversation._id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={MessageSquare}
                  title="No conversations yet"
                  description="Search for users to start chatting"
                />
              )}
            </ScrollArea>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="flex-1 overflow-hidden mt-0">
          <div className="h-full flex flex-col">
            <div className="p-3">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search users..."
              />
            </div>
            <ScrollArea className="flex-1">
              {searchingUsers ? (
                <div className="space-y-3 p-3">
                  {[...Array(3)].map((_, i) => (
                    <UserSearchSkeleton key={i} />
                  ))}
                </div>
              ) : users.length > 0 ? (
                <div className="space-y-1 p-2">
                  {users.map((user: any) => (
                    <UserSearchItem
                      key={user._id}
                      user={user}
                      onStartChat={handleStartChat}
                    />
                  ))}
                </div>
              ) : query.length >= 2 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No users found
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Type to search users
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
      )}
    </aside>
  );
}
