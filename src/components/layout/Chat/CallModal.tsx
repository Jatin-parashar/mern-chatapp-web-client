import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Dialog, DialogContent } from "../../ui/dialog";
import { useCall } from "../../../socket/hooks/useCall";
import type { RootState } from "../../../app/store";

const getInitials = (name: string): string => {
  return name.split(" ").map((word) => word[0]).join("").toUpperCase().slice(0, 2);
};

export default function CallModal() {
  const { answerCall, endCall, declineCall, toggleAudio, toggleVideo } = useCall();
  const {
    isCallActive,
    callStatus,
    incomingCall,
    localStream,
    remoteStream,
    isVideoCall,
    receiverInfo,
    isAudioEnabled,
    isVideoEnabled,
  } = useSelector((state: RootState) => state.call);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    if (callStatus === "connected") {
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        setCallDuration(0);
      }
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [callStatus]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      localVideoRef.current.play().catch(err => {
        if (import.meta.env.DEV) {
          console.error("Local video play error:", err);
        }
      });
    } else if (localVideoRef.current && !localStream) {
      localVideoRef.current.srcObject = null;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch(err => {
        if (import.meta.env.DEV) {
          console.error("Remote video play error:", err);
        }
      });
    } else if (remoteVideoRef.current && !remoteStream) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [remoteStream]);

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const participantInfo = incomingCall?.callerInfo || receiverInfo;

  return (
    <Dialog open={isCallActive || !!incomingCall} onOpenChange={(open) => !open && endCall()}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 bg-black border-none">
        {/* Incoming Call UI */}
        {incomingCall && callStatus === "ringing" && (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 sm:gap-8 px-4">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
              <AvatarImage src={incomingCall.callerInfo.profilePic || ""} />
              <AvatarFallback className="text-4xl bg-linear-to-br from-indigo-500 to-purple-600">
                {getInitials(incomingCall.callerInfo.name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{incomingCall.callerInfo.name}</h2>
              <p className="text-base sm:text-lg text-gray-300">
                {incomingCall.isVideoCall ? "Video Call" : "Voice Call"}
              </p>
            </div>
            <div className="flex gap-6 sm:gap-8">
              <Button
                size="lg"
                variant="destructive"
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full"
                onClick={declineCall}
              >
                <X className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>
              <Button
                size="lg"
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-green-600 hover:bg-green-700"
                onClick={answerCall}
              >
                {incomingCall.isVideoCall ? <Video className="h-6 w-6 sm:h-8 sm:w-8" /> : <Phone className="h-6 w-6 sm:h-8 sm:w-8" />}
              </Button>
            </div>
          </div>
        )}

        {/* Active Call UI */}
        {isCallActive && callStatus !== "ringing" && (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-3 sm:p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={participantInfo?.profilePic || ""} />
                  <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600">
                    {getInitials(participantInfo?.name || "User")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-semibold">{participantInfo?.name}</h3>
                  <p className="text-sm text-gray-300">
                    {callStatus === "connected"
                      ? formatCallDuration(callDuration)
                      : callStatus === "connecting"
                      ? "Connecting..."
                      : "Calling..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Video Container */}
            {isVideoCall && (
              <div className="flex-1 relative">
                {/* Remote Video */}
                <div className="absolute inset-0">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {(!remoteStream || callStatus !== "connected") && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={participantInfo?.profilePic || ""} />
                        <AvatarFallback className="text-4xl bg-linear-to-br from-indigo-500 to-purple-600">
                          {getInitials(participantInfo?.name || "User")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>

                {/* Local Video */}
                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-24 h-32 sm:w-48 sm:h-36 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  {(!localStream || !isVideoEnabled) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-linear-to-br from-indigo-500 to-purple-600">
                          You
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Audio Only Call */}
            {!isVideoCall && (
              <div className="flex-1 flex items-center justify-center">
                <Avatar className="h-48 w-48">
                  <AvatarImage src={participantInfo?.profilePic || ""} />
                  <AvatarFallback className="text-6xl bg-linear-to-br from-indigo-500 to-purple-600">
                    {getInitials(participantInfo?.name || "User")}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            {/* Call Controls */}
            <div className="p-4 sm:p-8 flex items-center justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                variant={isAudioEnabled ? "secondary" : "destructive"}
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-full"
                onClick={toggleAudio}
              >
                {isAudioEnabled ? <Mic className="h-5 w-5 sm:h-6 sm:w-6" /> : <MicOff className="h-5 w-5 sm:h-6 sm:w-6" />}
              </Button>

              {isVideoCall && (
                <Button
                  size="lg"
                  variant={isVideoEnabled ? "secondary" : "destructive"}
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-full"
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? <Video className="h-5 w-5 sm:h-6 sm:w-6" /> : <VideoOff className="h-5 w-5 sm:h-6 sm:w-6" />}
                </Button>
              )}

              <Button
                size="lg"
                variant="destructive"
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-full"
                onClick={endCall}
              >
                <PhoneOff className="h-6 w-6 sm:h-8 sm:w-8" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
