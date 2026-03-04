import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/entities";
import type { CallStatus, IncomingCall } from "../../types/common";

interface CallState {
  isCallActive: boolean;
  callStatus: CallStatus;
  incomingCall: IncomingCall | null;
  callerInfo: User | null;
  receiverInfo: User | null;
  isVideoCall: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  callId: string | null;
}

const initialState: CallState = {
  isCallActive: false,
  callStatus: "idle",
  incomingCall: null,
  callerInfo: null,
  receiverInfo: null,
  isVideoCall: false,
  isAudioEnabled: true,
  isVideoEnabled: true,
  callId: null,
};

const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    setCallStatus: (state, action: PayloadAction<CallStatus>) => {
      state.callStatus = action.payload;
    },
    setIncomingCall: (state, action: PayloadAction<IncomingCall | null>) => {
      state.incomingCall = action.payload;
      if (action.payload) {
        state.isCallActive = true;
        state.callStatus = "ringing";
        state.isVideoCall = action.payload.isVideoCall;
        state.callerInfo = action.payload.callerInfo as User;
        state.callId = action.payload.callId;
        state.isAudioEnabled = true;
        state.isVideoEnabled = action.payload.isVideoCall;
      } else {
        state.callerInfo = null;
        if (state.callStatus === "ringing") {
          state.isCallActive = false;
          state.callStatus = "idle";
          state.isVideoCall = false;
          state.callId = null;
        }
      }
    },
    startCall: (state, action: PayloadAction<{ 
      receiverInfo: User; 
      isVideoCall: boolean; 
      callId: string 
    }>) => {
      const { receiverInfo, isVideoCall, callId } = action.payload;
      state.isCallActive = true;
      state.callStatus = "calling";
      state.receiverInfo = receiverInfo;
      state.isVideoCall = isVideoCall;
      state.callId = callId;
      state.isAudioEnabled = true;
      state.isVideoEnabled = isVideoCall;
      state.callerInfo = null;
    },
    acceptCall: (state) => {
      state.callStatus = "connecting";
      state.isCallActive = true;
    },
    connectCall: (state) => {
      state.callStatus = "connected";
    },
    endCall: () => initialState,
    toggleAudio: (state) => {
      state.isAudioEnabled = !state.isAudioEnabled;
    },
    toggleVideo: (state) => {
      state.isVideoEnabled = !state.isVideoEnabled;
    },
    setCallId: (state, action: PayloadAction<string | null>) => {
      state.callId = action.payload;
    },
  },
});

export const {
  setCallStatus,
  setIncomingCall,
  startCall,
  acceptCall,
  connectCall,
  endCall,
  toggleAudio,
  toggleVideo,
  setCallId,
} = callSlice.actions;
export default callSlice.reducer;