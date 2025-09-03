import { RTCPeerConnection, RTCIceCandidate, RTCSessionDescription, mediaDevices } from 'react-native-webrtc';
import { apiService } from './api';

export interface WebRTCConfig {
  iceServers: Array<{
    urls: string[];
    username?: string;
    credential?: string;
    credentialType?: string;
  }>;
  timestamp: number;
  ttl: number;
}

export interface CallData {
  callId: string;
  callerId: number;
  receiverId: number;
  type: 'audio' | 'video';
  offer?: RTCSessionDescription;
  answer?: RTCSessionDescription;
  candidate?: RTCIceCandidate;
}

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: any = null;
  private remoteStream: any = null;
  private config: WebRTCConfig | null = null;
  private callId: string | null = null;

  constructor(
    private onLocalStream: (stream: any) => void,
    private onRemoteStream: (stream: any) => void,
    private onCallEnded: () => void,
    private onError: (error: string) => void,
    private webSocketService: any
  ) {}

  async getWebRTCConfig(): Promise<WebRTCConfig> {
    try {
      const response = await apiService.getWebRTCConfig();
      this.config = response;
      return response;
    } catch (error) {
      console.error('Error getting WebRTC config:', error);
      throw error;
    }
  }

  async initializeCall(callType: 'audio' | 'video'): Promise<void> {
    try {
      await this.getWebRTCConfig();
      
      if (!this.config) {
        throw new Error('WebRTC configuration not available');
      }

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers.map(server => ({
          urls: server.urls,
          username: server.username || undefined,
          credential: server.credential || undefined,
        })),
      });

      // Set up event listeners
      this.setupPeerConnectionEvents();

      // Get user media
      const constraints = {
        audio: true,
        video: callType === 'video' ? {
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user',
        } : false,
      };

      this.localStream = await mediaDevices.getUserMedia(constraints);
      
      // Add stream to peer connection
      this.localStream.getTracks().forEach((track: any) => {
        this.peerConnection?.addTrack(track, this.localStream);
      });

      this.onLocalStream(this.localStream);
    } catch (error) {
      console.error('Error initializing call:', error);
      this.onError('Failed to initialize call');
      throw error;
    }
  }

  async startCall(receiverId: number, callType: 'audio' | 'video'): Promise<void> {
    try {
      await this.initializeCall(callType);
      
      this.callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create offer
      const offer = await this.peerConnection!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });
      
      await this.peerConnection!.setLocalDescription(offer);
      
      // Send call offer via WebSocket
      this.webSocketService.sendCallOffer({
        callId: this.callId,
        receiverId,
        type: callType,
        offer,
      });
    } catch (error) {
      console.error('Error starting call:', error);
      this.onError('Failed to start call');
    }
  }

  async acceptCall(callData: CallData): Promise<void> {
    try {
      await this.initializeCall(callData.type);
      
      this.callId = callData.callId;
      
      if (callData.offer) {
        await this.peerConnection!.setRemoteDescription(callData.offer);
        
        // Create answer
        const answer = await this.peerConnection!.createAnswer();
        await this.peerConnection!.setLocalDescription(answer);
        
        // Send answer via WebSocket
        this.webSocketService.sendCallAnswer({
          callId: this.callId,
          answer,
        });
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      this.onError('Failed to accept call');
    }
  }

  async handleCallAnswer(answer: RTCSessionDescription): Promise<void> {
    try {
      await this.peerConnection?.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling call answer:', error);
      this.onError('Failed to handle call answer');
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    try {
      await this.peerConnection?.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  async endCall(): Promise<void> {
    try {
      if (this.callId) {
        this.webSocketService.sendCallEnd({ callId: this.callId });
      }
      
      this.cleanup();
      this.onCallEnded();
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }

  async toggleMute(): Promise<boolean> {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled;
      }
    }
    return false;
  }

  async toggleCamera(): Promise<boolean> {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled;
      }
    }
    return false;
  }

  async switchCamera(): Promise<void> {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack._switchCamera();
      }
    }
  }

  private setupPeerConnectionEvents(): void {
    if (!this.peerConnection) return;

    this.peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate && this.callId) {
        this.webSocketService.sendIceCandidate({
          callId: this.callId,
          candidate: event.candidate,
        });
      }
    });

    this.peerConnection.addEventListener('track', (event) => {
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStream(this.remoteStream);
      }
    });

    this.peerConnection.addEventListener('iceconnectionstatechange', () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('ICE connection state:', state);
      
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.cleanup();
        this.onCallEnded();
      }
    });

    this.peerConnection.addEventListener('connectionstatechange', () => {
      const state = this.peerConnection?.connectionState;
      console.log('Connection state:', state);
      
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.cleanup();
        this.onCallEnded();
      }
    });
  }

  private cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track: any) => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.remoteStream = null;
    this.callId = null;
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  isCallActive(): boolean {
    return this.callId !== null && this.peerConnection !== null;
  }
}
