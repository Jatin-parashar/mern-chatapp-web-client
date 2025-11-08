import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Peer from "simple-peer";
import type { Instance, SignalData } from "simple-peer";
import type { RootState } from "../../app/store";
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

  const activeConversationRef = useRef(activeConversation);
  const peerRef = useRef<Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingSignalRef = useRef<SignalData | null>(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
    peerRef.current = peer;
  }, [activeConversation, peer]);

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
      // Cast the signal to SignalData for simple-peer compatibility
      pendingSignalRef.current = signal as unknown as SignalData;
    };

    const handleCallAccepted = ({ signal }: CallAcceptedEventData) => {
      dispatch(setCallStatus("connecting"));
      if (peerRef.current) {
        peerRef.current.signal(signal as unknown as SignalData);
      } else {
        pendingSignalRef.current = signal as unknown as SignalData;
      }
    };

    const handleCallDeclined = (_data: CallDeclinedEventData) => {
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
          peerRef.current.signal(signal as unknown as SignalData);
        } catch (error) {
          console.error("Error handling signal:", error);
        }
      } else {
        pendingSignalRef.current = signal as unknown as SignalData;
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
      console.error("Error accessing media devices:", error);
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
          const receiver = activeConversationRef.current?.participants.find(
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
        console.error("Peer error:", error);
        dispatch(endCallAction());
        cleanupCall();
      });

      peer.on("close", () => {
        console.log("Peer connection closed");
        dispatch(endCallAction());
        cleanupCall();
      });

      peer.on("connect", () => {
        console.log("Peer connected");
        if (pendingSignalRef.current) {
          try {
            peer.signal(pendingSignalRef.current);
            pendingSignalRef.current = null;
          } catch (error) {
            console.error("Error processing pending signal:", error);
          }
        }
      });

      return peer;
    },
    [socket, currentUser, dispatch, cleanupCall]
  );

  // Initiate call
  const initiateCall = useCallback(
    async (receiverId: string, isVideoCall: boolean) => {
      try {
        const stream = await getMediaStream(isVideoCall);
        const newCallId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const receiver = activeConversationRef.current?.participants.find(
          (p) => p._id === receiverId
        );

        if (!receiver) {
          throw new Error("Receiver not found");
        }

        dispatch(startCall({ receiverInfo: receiver, isVideoCall, callId: newCallId }));

        const peer = createPeerConnection(true, stream, newCallId);
        peerRef.current = peer;
        dispatch(setPeer(peer));
      } catch (error) {
        console.error("Error initiating call:", error);
        dispatch(endCallAction());
        cleanupCall();
      }
    },
    [getMediaStream, createPeerConnection, dispatch, cleanupCall]
  );

  // Answer call
  const answerCall = useCallback(async () => {
    try {
      if (!incomingCall) {
        console.error("No incoming call to answer");
        return;
      }

      const stream = await getMediaStream(incomingCall.isVideoCall);
      const peer = createPeerConnection(false, stream, incomingCall.callId);

      if (pendingSignalRef.current) {
        try {
          peer.signal(pendingSignalRef.current);
          pendingSignalRef.current = null;
        } catch (error) {
          console.error("Error processing initial signal:", error);
        }
      }

      peerRef.current = peer;
      dispatch(setPeer(peer as any)); // Cast to any if Redux expects RTCPeerConnection
      dispatch(acceptCall());
      dispatch(setCallId(incomingCall.callId));
      dispatch(setIncomingCall(null));
    } catch (error) {
      console.error("Error answering call:", error);
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