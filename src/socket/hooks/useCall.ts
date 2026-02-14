import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Peer from "simple-peer";
import type { Instance, SignalData } from "simple-peer";
import type { RootState } from "../../app/store";
import { showCallNotification } from "../../utils/notifications";
import {
  setIncomingCall,
  setCallStatus,
  startCall,
  acceptCall,
  connectCall,
  endCall as endCallAction,
  setLocalStream,
  setRemoteStream,
  setPeer,
  setCallId,
  toggleAudio as toggleAudioAction,
  toggleVideo as toggleVideoAction,
} from "../../features/call/callSlice";
import { useSocketInstance } from "../SocketContext";
import {
  SOCKET_CALL_INITIATED,
  SOCKET_CALL_RECEIVED,
  SOCKET_CALL_ACCEPTED,
  SOCKET_CALL_DECLINED,
  SOCKET_CALL_ENDED,
  SOCKET_CALL_SIGNAL,
  SOCKET_CALL_PEER_DISCONNECTED,
} from "../socketEvents";
import type {
  CallReceivedEventData,
  CallAcceptedEventData,
  CallDeclinedEventData,
  CallEndedEventData,
  CallSignalEventData,
  CallPeerDisconnectedEventData,
} from "../../types/socket";

export const useCall = () => {
  const { socket } = useSocketInstance();
  const dispatch = useDispatch();
  
  const currentUser = useSelector((state: RootState) => state.user);
  const activeConversation = useSelector((state: RootState) => state.chat.activeConversation);
  const {
    peer,
    callId,
    incomingCall,
  } = useSelector((state: RootState) => state.call);

  const peerRef = useRef<Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingSignalRef = useRef<SignalData | null>(null);

  useEffect(() => {
    peerRef.current = peer;
  }, [peer]);

  // Cleanup function
  const cleanupCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    pendingSignalRef.current = null;
    dispatch(setLocalStream(null));
    dispatch(setRemoteStream(null));
    dispatch(setPeer(null));
    dispatch(setCallId(null));
  }, [dispatch]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleCallReceived = ({ callId, callerInfo, isVideoCall, signal }: CallReceivedEventData) => {
      dispatch(setIncomingCall({ callId, callerInfo, isVideoCall }));
      dispatch(setCallStatus("ringing"));
      pendingSignalRef.current = signal as SignalData;
      showCallNotification(callerInfo.name, isVideoCall, callerInfo.profilePic);
    };

    const handleCallAccepted = ({ signal }: CallAcceptedEventData) => {
      dispatch(setCallStatus("connecting"));
      if (peerRef.current) {
        peerRef.current.signal(signal as SignalData);
      } else {
        pendingSignalRef.current = signal as SignalData;
      }
    };

    const handleCallDeclined = (data: CallDeclinedEventData) => {
      const reason = data.reason || "Call declined";
      if (reason === "User is offline") {
        alert("User is currently offline");
      } else if (reason === "No answer") {
        alert("No answer");
      }
      dispatch(endCallAction());
      cleanupCall();
    };

    const handleCallEnded = (_data: CallEndedEventData) => {
      dispatch(endCallAction());
      cleanupCall();
    };

    const handleCallSignal = ({ signal }: CallSignalEventData) => {
      if (peerRef.current) {
        try {
          peerRef.current.signal(signal as SignalData);
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Error handling signal:", error);
          }
        }
      } else {
        pendingSignalRef.current = signal as SignalData;
      }
    };

    const handlePeerDisconnected = (_data: CallPeerDisconnectedEventData) => {
      dispatch(endCallAction());
      cleanupCall();
    };

    socket.on(SOCKET_CALL_RECEIVED, handleCallReceived);
    socket.on(SOCKET_CALL_ACCEPTED, handleCallAccepted);
    socket.on(SOCKET_CALL_DECLINED, handleCallDeclined);
    socket.on(SOCKET_CALL_ENDED, handleCallEnded);
    socket.on(SOCKET_CALL_SIGNAL, handleCallSignal);
    socket.on(SOCKET_CALL_PEER_DISCONNECTED, handlePeerDisconnected);

    return () => {
      socket.off(SOCKET_CALL_RECEIVED, handleCallReceived);
      socket.off(SOCKET_CALL_ACCEPTED, handleCallAccepted);
      socket.off(SOCKET_CALL_DECLINED, handleCallDeclined);
      socket.off(SOCKET_CALL_ENDED, handleCallEnded);
      socket.off(SOCKET_CALL_SIGNAL, handleCallSignal);
      socket.off(SOCKET_CALL_PEER_DISCONNECTED, handlePeerDisconnected);
    };
  }, [socket, dispatch, cleanupCall]);

  // Get media stream
  const getMediaStream = useCallback(async (isVideoCall: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoCall,
        audio: true,
      });
      localStreamRef.current = stream;
      dispatch(setLocalStream(stream));
      return stream;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error accessing media devices:", error);
      }
      throw error;
    }
  }, [dispatch]);

  // Create peer connection
  const createPeerConnection = useCallback(
    (initiator: boolean, stream: MediaStream, callId: string) => {
      const peer = new Peer({
        initiator,
        trickle: false,
        stream,
      });

      peer.on("signal", (signal: SignalData) => {
        if (!socket) return;

        if (initiator) {
          const receiver = activeConversation?.participants.find(
            (p) => p._id !== currentUser._id
          );
          
          if (receiver) {
            socket.emit(SOCKET_CALL_INITIATED, {
              callId,
              receiverId: receiver._id,
              callerInfo: {
                _id: currentUser._id,
                name: currentUser.name,
                username: currentUser.username,
                profilePic: currentUser.profilePic,
              },
              isVideoCall: stream.getVideoTracks().length > 0,
              signal,
            });
          }
        } else {
          socket.emit(SOCKET_CALL_ACCEPTED, { callId, signal });
        }
      });

      peer.on("stream", (remoteStream: MediaStream) => {
        dispatch(setRemoteStream(remoteStream));
        dispatch(connectCall());
      });

      peer.on("error", (error: Error) => {
        if (import.meta.env.DEV) {
          console.error("Peer error:", error);
        }
        // Don't auto-cleanup on error, let user end call
      });

      peer.on("close", () => {
        if (import.meta.env.DEV) {
          console.log("Peer connection closed");
        }
        // Don't auto-cleanup on close, let user end call
      });

      return peer;
    },
    [socket, currentUser, activeConversation, dispatch]
  );

  // Initiate call
  const initiateCall = useCallback(
    async (receiverId: string, isVideoCall: boolean) => {
      try {
        const receiver = activeConversation?.participants.find(
          (p) => p._id === receiverId
        );

        if (!receiver) {
          throw new Error("Receiver not found");
        }

        const stream = await getMediaStream(isVideoCall);
        const newCallId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        dispatch(startCall({ receiverInfo: receiver, isVideoCall, callId: newCallId }));

        const peer = createPeerConnection(true, stream, newCallId);
        peerRef.current = peer;
        dispatch(setPeer(peer));
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error initiating call:", error);
        }
        alert("Failed to access camera/microphone. Please check permissions.");
        dispatch(endCallAction());
        cleanupCall();
      }
    },
    [getMediaStream, createPeerConnection, dispatch, cleanupCall, activeConversation]
  );

  // Answer call
  const answerCall = useCallback(async () => {
    try {
      if (!incomingCall) {
        if (import.meta.env.DEV) {
          console.error("No incoming call to answer");
        }
        return;
      }

      const stream = await getMediaStream(incomingCall.isVideoCall);
      
      dispatch(acceptCall());
      dispatch(setCallId(incomingCall.callId));
      
      const peer = createPeerConnection(false, stream, incomingCall.callId);
      peerRef.current = peer;
      dispatch(setPeer(peer));
      
      // Signal the offer after peer is created
      if (pendingSignalRef.current) {
        peer.signal(pendingSignalRef.current);
        pendingSignalRef.current = null;
      }
      
      dispatch(setIncomingCall(null));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error answering call:", error);
      }
      alert("Failed to access camera/microphone. Please check permissions.");
      dispatch(endCallAction());
      cleanupCall();
    }
  }, [incomingCall, getMediaStream, createPeerConnection, dispatch, cleanupCall]);

  // Decline call
  const declineCall = useCallback(() => {
    if (!socket || !incomingCall) return;
    
    socket.emit(SOCKET_CALL_DECLINED, { callId: incomingCall.callId });
    dispatch(setIncomingCall(null));
    dispatch(setCallStatus("idle"));
    cleanupCall();
  }, [socket, incomingCall, dispatch, cleanupCall]);

  // End call
  const endCall = useCallback(() => {
    if (!socket) return;

    if (callId) {
      socket.emit(SOCKET_CALL_ENDED, { callId });
    }
    dispatch(endCallAction());
    cleanupCall();
  }, [socket, callId, dispatch, cleanupCall]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        dispatch(toggleAudioAction());
      }
    }
  }, [dispatch]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        dispatch(toggleVideoAction());
      }
    }
  }, [dispatch]);

  return {
    initiateCall,
    answerCall,
    declineCall,
    endCall,
    toggleAudio,
    toggleVideo,
  };
};