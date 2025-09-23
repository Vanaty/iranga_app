import { NotificationService } from '@/services/notifications';
import { CallData, WebRTCService } from '@/services/webrtc';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
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
  const webRTCService = useRef<WebRTCService | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [callData, setCallData] = useState<CallData | null>(null);
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isCallConnected, setIsCallConnected] = useState(false);

  useEffect(() => {
    if (webRTCService.current) return;
    if (!webSocketService || !user) return;
    initializeWebRTCService();
    setNotificationHandler();
  }, [webSocketService, user]);

  const initializeWebRTCService = () => {

    webRTCService.current = new WebRTCService(
      handleLocalStream,
      handleRemoteStream,
      handleCallEnded,
      handleError,
      webSocketService!
    );
    console.info('WebRTC Service instance created');

    // Update WebSocket service with call handlers
    webSocketService!.onCallOffer = handleIncomingCall;
    webSocketService!.onCallAnswer = handleCallAnswer;
    webSocketService!.onCallCandidate = handleIceCandidate;
    webSocketService!.onCallEnd = onCallEnd;
    console.info('WebRTC Service initialized for user:', webSocketService!.user.username);
  };

  const setNotificationHandler = async () => {
    NotificationService.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      if (data?.callData && data?.type === 'incoming_call') {
        handleIncomingCall(data.callData as CallData);
      }
    });
  }

  const handleLocalStream = (stream: any) => {
    setLocalStream(stream);
  };

  const handleRemoteStream = (stream: any) => {
    setRemoteStream(stream);
    setIsCallConnected(true);
  };

  const onCallEnd = (callId: string) => {
    endCall();
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
    console.info('Call ended');
  };

  const handleError = (error: string) => {
    console.error('WebRTC Error:', error);
    // Don't automatically end call on error, let user decide
    // handleCallEnded();
  };

  const handleIncomingCall = (incomingCallData: CallData) => {
    setCallData(incomingCallData);
    setIsIncomingCall(true);
  };

  const handleCallAnswer = async (answerData: CallData) => {
    if (webRTCService.current && answerData.answer) {
      await webRTCService.current.handleCallAnswer(answerData.answer);
    }
  };

  const handleIceCandidate = async (candidateData: any) => {
    console.info('Received ICE candidate:', webSocketService!.user.username, webSocketService!.user.id, webRTCService !== null);
    if (webRTCService.current && candidateData.candidate) {
      await webRTCService.current.handleIceCandidate(candidateData.candidate);
    }
  };

  const startCall = async (receiverId: number, callType: 'audio' | 'video') => {
    if (!webRTCService.current || isCallActive) return;
    try {
      setIsCallActive(true);
      await webRTCService.current.startCall(receiverId, callType);
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
      await webRTCService.current!.acceptCall(callData);
    } catch (error) {
      console.error('Error accepting call:', error);
      handleCallEnded();
    }
  };

  const rejectCall = () => {
    if (webRTCService.current && callData) {
      webRTCService.current.endCall();
    }
    handleCallEnded();
  };

  const endCall = async () => {
    if (webRTCService.current) {
      await webRTCService.current.endCall();
    }
    handleCallEnded();
  };

  const toggleMute = async () => {
    if (webRTCService.current) {
      const muted = await webRTCService.current.toggleMute();
      setIsMuted(muted);
    }
  };

  const toggleCamera = async () => {
    if (webRTCService.current) {
      const cameraOff = await webRTCService.current.toggleCamera();
      setIsCameraOff(cameraOff);
    }
  };

  const switchCamera = async () => {
    if (webRTCService.current) {
      await webRTCService.current.switchCamera();
    }
  };

  return (
    <CallContext.Provider
      value={{
        webRTCService: webRTCService.current,
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
