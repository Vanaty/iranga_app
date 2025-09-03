import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WebRTCService, CallData } from '@/services/webrtc';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';

interface CallContextType {
  webRTCService: WebRTCService | null;
  isCallActive: boolean;
  isIncomingCall: boolean;
  callData: CallData | null;
  localStream: any;
  remoteStream: any;
  isMuted: boolean;
  isCameraOff: boolean;
  isCallConnected: boolean;
  startCall: (receiverId: number, callType: 'audio' | 'video') => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => Promise<void>;
  toggleMute: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  switchCamera: () => Promise<void>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { webSocketService } = useChat();
  const [webRTCService, setWebRTCService] = useState<WebRTCService | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callData, setCallData] = useState<CallData | null>(null);
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);

  useEffect(() => {
    if (webSocketService && user) {
      initializeWebRTCService();
    }
  }, [webSocketService, user]);

  const initializeWebRTCService = () => {
    const service = new WebRTCService(
      handleLocalStream,
      handleRemoteStream,
      handleCallEnded,
      handleError,
      webSocketService
    );

    setWebRTCService(service);

    // Update WebSocket service with call handlers
    webSocketService!.onCallOffer = handleIncomingCall;
    webSocketService!.onCallAnswer = handleCallAnswer;
    webSocketService!.onCallCandidate = handleIceCandidate;
    webSocketService!.onCallEnd = handleCallEnded;
  };

  const handleLocalStream = (stream: any) => {
    setLocalStream(stream);
  };

  const handleRemoteStream = (stream: any) => {
    setRemoteStream(stream);
    setIsCallConnected(true);
  };

  const handleCallEnded = () => {
    setIsCallActive(false);
    setIsIncomingCall(false);
    setIsCallConnected(false);
    setCallData(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
  };

  const handleError = (error: string) => {
    console.error('WebRTC Error:', error);
    handleCallEnded();
  };

  const handleIncomingCall = (incomingCallData: CallData) => {
    setCallData(incomingCallData);
    setIsIncomingCall(true);
  };

  const handleCallAnswer = async (answerData: any) => {
    if (webRTCService && answerData.answer) {
      await webRTCService.handleCallAnswer(answerData.answer);
    }
  };

  const handleIceCandidate = async (candidateData: any) => {
    if (webRTCService && candidateData.candidate) {
      await webRTCService.handleIceCandidate(candidateData.candidate);
    }
  };

  const startCall = async (receiverId: number, callType: 'audio' | 'video') => {
    if (!webRTCService) return;

    try {
      setIsCallActive(true);
      await webRTCService.startCall(receiverId, callType);
    } catch (error) {
      console.error('Error starting call:', error);
      setIsCallActive(false);
    }
  };

  const acceptCall = async () => {
    if (!webRTCService || !callData) return;

    try {
      setIsIncomingCall(false);
      setIsCallActive(true);
      await webRTCService.acceptCall(callData);
    } catch (error) {
      console.error('Error accepting call:', error);
      handleCallEnded();
    }
  };

  const rejectCall = () => {
    if (webRTCService && callData) {
      webRTCService.endCall();
    }
    handleCallEnded();
  };

  const endCall = async () => {
    if (webRTCService) {
      await webRTCService.endCall();
    }
    handleCallEnded();
  };

  const toggleMute = async () => {
    if (webRTCService) {
      const muted = await webRTCService.toggleMute();
      setIsMuted(muted);
    }
  };

  const toggleCamera = async () => {
    if (webRTCService) {
      const cameraOff = await webRTCService.toggleCamera();
      setIsCameraOff(cameraOff);
    }
  };

  const switchCamera = async () => {
    if (webRTCService) {
      await webRTCService.switchCamera();
    }
  };

  return (
    <CallContext.Provider
      value={{
        webRTCService,
        isCallActive,
        isIncomingCall,
        callData,
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        isCallConnected,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        switchCamera,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}
