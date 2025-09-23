import { mediaDevices, RTCIceCandidate, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import { apiService } from './api';
import { WebSocketService } from './websocket';

// Check WebRTC availability
if (!RTCPeerConnection || !mediaDevices) {
  console.error('WebRTC is not available on this device');
}

export interface WebRTCConfig {
  iceServers: {
    urls: string[];
    username?: string;
    credential?: string;
    credentialType?: string;
  }[];
  timestamp: number;
  ttl: number;
}

export interface CallData {
  callId: string;
  callerId: number;
  receiverId: number;
  callerName: string;
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
    private webSocketService: WebSocketService
  ) {}

  async getWebRTCConfig(): Promise<WebRTCConfig> {
    try {
      const response = await apiService.getWebRTCConfig();
      this.config = response;
      return response;
    } catch (error) {
      console.warn('Error getting WebRTC config from server, using fallback:', error);
      // Fallback configuration with public STUN servers
      this.config = {
        iceServers: [
          {
            urls: ['stun:stun.l.google.com:19302'],
          },
          {
            urls: ['stun:stun1.l.google.com:19302'],
          },
          {
            urls: ['stun:stun2.l.google.com:19302'],
          },
        ],
        timestamp: Date.now(),
        ttl: 3600,
      };
      return this.config;
    }
  }

  async initializeCall(callType: 'audio' | 'video'): Promise<void> {
    try {
      console.log('Initializing WebRTC call:', callType);
      // await this.getWebRTCConfig();
      
      // if (!this.config) {
      //   throw new Error('WebRTC configuration not available');
      // }

      console.log('WebRTC config loaded:', this.config);

      // Create peer connection
      // this.peerConnection = new RTCPeerConnection({
      //   iceServers: this.config.iceServers.map(server => ({
      //     urls: server.urls,
      //     username: server.username || undefined,
      //     credential: server.credential || undefined,
      //   })),
      // });
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
            {
              urls: "stun:stun.relay.metered.ca:80",
            },
            {
              urls: "turn:standard.relay.metered.ca:80",
              username: "863b02042f13941fcfe44dd5",
              credential: "at2XhxmfM6MZy0rU",
            },
            {
              urls: "turn:standard.relay.metered.ca:80?transport=tcp",
              username: "863b02042f13941fcfe44dd5",
              credential: "at2XhxmfM6MZy0rU",
            },
            {
              urls: "turn:standard.relay.metered.ca:443",
              username: "863b02042f13941fcfe44dd5",
              credential: "at2XhxmfM6MZy0rU",
            },
            {
              urls: "turns:standard.relay.metered.ca:443?transport=tcp",
              username: "863b02042f13941fcfe44dd5",
              credential: "at2XhxmfM6MZy0rU",
            },
        ],
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
      console.log('User media obtained:', this.localStream);
      
      // Add stream to peer connection
      this.localStream.getTracks().forEach((track: any) => {
        console.log('Adding track to peer connection:', track.kind);
        this.peerConnection?.addTrack(track, this.localStream);
      });

      this.onLocalStream(this.localStream);
      console.log('Call initialization completed successfully');
    } catch (error) {
      console.error('Error initializing call:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.onError(`Failed to initialize call: ${errorMessage}`);
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
        callerId: this.webSocketService.user.id,
        callerName: this.webSocketService.user.firstName + ' ' + this.webSocketService.user.lastName,
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
        await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(callData.offer));

        // Create answer
        const answer = await this.peerConnection!.createAnswer();
        await this.peerConnection!.setLocalDescription(answer);
        
        // Send answer via WebSocket
        this.webSocketService.sendCallAnswer({
          callId: this.callId,
          userId: this.webSocketService.user.id,
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
      await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling call answer:', error);
      this.onError('Failed to handle call answer');
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidate): Promise<void> {
    try {
      console.info('Set remote ICE candidate:', this.webSocketService.user.username);
      await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  async endCall(): Promise<void> {
    try {
      if (this.callId) {
        this.webSocketService.sendCallEnd({ callId: this.callId, userId: this.webSocketService.user.id });
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
      if (videoTrack && videoTrack._switchCamera) {
        try {
          videoTrack._switchCamera();
        } catch (error) {
          console.warn('Camera switch not supported:', error);
        }
      } else {
        console.warn('Camera switching not available on this device');
      }
    }
  }

  private setupPeerConnectionEvents(): void {
    if (!this.peerConnection) return;

    this.peerConnection.addEventListener('icecandidate', (event) => {
      if (event.candidate && this.callId) {
        console.info('New ICE candidate:', this.webSocketService.user.username);
        this.webSocketService.sendIceCandidate({
          callId: this.callId,
          userId: this.webSocketService.user.id,
          candidate: {
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            sdpMid: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
          },
        });
      }
    });

    this.peerConnection.addEventListener('track', (event) => {
      console.info('Remote track received', this.webSocketService.user.username);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        this.onRemoteStream(this.remoteStream);
      }
    });

    this.peerConnection.addEventListener('iceconnectionstatechange', () => {
      const state = this.peerConnection?.iceConnectionState;
      console.log('ICE connection state changed:', state, this.webSocketService.user.username);
      
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        console.log('ICE connection failed, cleaning up');
        this.cleanup();
        this.onCallEnded();
      }
    });

    this.peerConnection.addEventListener('connectionstatechange', () => {
      const state = this.peerConnection?.connectionState;
      console.log('Connection state changed:', state, this.webSocketService.user.username);
      
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        console.log('Connection failed, cleaning up');
        this.cleanup();
        this.onCallEnded();
      }
    });

    this.peerConnection.addEventListener('icegatheringstatechange', () => {
      const state = this.peerConnection?.iceGatheringState;
      console.log('ICE gathering state:', state, this.webSocketService.user.username);
    });

    this.peerConnection.addEventListener('signalingstatechange', () => {
      const state = this.peerConnection?.signalingState;
      console.log('Signaling state:', state, this.webSocketService.user.username);
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
