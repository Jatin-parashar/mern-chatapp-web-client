import { Helmet } from "react-helmet";
import { useSelector } from "react-redux";
import { useState } from "react";
import type { RootState } from "../app/store";
import { appTitle } from "../utils/constants";
import Sidebar from "../components/layout/Sidebar/Sidebar";
import Chat from "../components/layout/Chat/Chat";
import CallModal from "../components/layout/Chat/CallModal";

export default function ChatPage() {
  const activeConversation = useSelector((state: RootState) => state.chat.activeConversation);
  const [profileUser, setProfileUser] = useState<any>(null);

  const handleViewProfile = (user: any) => {
    setProfileUser(user);
  };

  const handleCloseProfile = () => {
    setProfileUser(null);
  };

  return (
    <>
      <Helmet>
        <title>{appTitle}</title>
        <meta name="description" content="Real-time messaging, video calls, and file sharing" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="canonical" href={window.location.origin} />
        <meta property="og:title" content={appTitle} />
        <meta property="og:description" content="Real-time messaging, video calls, and file sharing" />
        <meta property="og:url" content={window.location.origin} />
      </Helmet>
      <div className="h-screen w-screen flex overflow-hidden">
        <div className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96`}>
          <Sidebar profileUser={profileUser} onCloseProfile={handleCloseProfile} />
        </div>
        <div className={`${activeConversation ? 'flex' : 'hidden md:flex'} flex-1`}>
          <Chat onViewProfile={handleViewProfile} />
        </div>
      </div>
      <CallModal />
    </>
  );
}