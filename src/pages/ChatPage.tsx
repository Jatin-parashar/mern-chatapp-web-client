import { useDispatch, useSelector } from "react-redux";
import { useLogoutMutation } from "../features/auth/authApi";
import { logout } from "../features/auth/authSlice";
import { releaseChatInfo } from "../features/chat/chatSlice";
import { deleteUser } from "../features/user/userSlice";
import { Button } from "../components/ui/button";
import { LogOut, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import type { RootState } from "../app/store";
import { authToasts } from "../utils/toast";
import { Helmet } from "react-helmet";
import { appTitle } from "../utils/constants";

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export default function ChatPage() {
  const dispatch = useDispatch();
  const [logoutMutation, { isLoading }] = useLogoutMutation();
  const user = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      authToasts.logoutSuccess();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
      dispatch(releaseChatInfo());
      dispatch(deleteUser());
      localStorage.removeItem('refreshToken');
    }
  };

  return (
    <>
      <Helmet>
        <title>{appTitle}</title>
        <meta name="description" content="Real-time messaging, video calls, and file sharing" />
        <link rel="canonical" href={window.location.origin} />
        <meta property="og:title" content={appTitle} />
        <meta property="og:description" content="Real-time messaging, video calls, and file sharing" />
        <meta property="og:url" content={window.location.origin} />
      </Helmet>
      <div className="h-screen w-screen flex bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Sidebar */}
      <aside className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ChatApp
            </h1>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profilePic} alt={user.name} />
              <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600 text-white text-sm">
                {user.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoading}
              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2">
              Conversations
            </h2>
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-muted-foreground">
                No conversations yet
              </p>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Chat Area */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center space-y-4 px-4">
          <div className="mx-auto w-16 h-16 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to ChatApp
            </h2>
            <p className="text-muted-foreground mt-2">
              Select a conversation to start chatting
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}