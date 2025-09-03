import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { RTCView } from 'react-native-webrtc';
import { useCall } from '@/contexts/CallContext';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff,
  RotateCcw,
  Minimize2 
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

export default function VideoCallScreen() {
  const {
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    isCallConnected,
    endCall,
    toggleMute,
    toggleCamera,
    switchCamera,
  } = useCall();

  useEffect(() => {
    if (!localStream && !remoteStream) {
      router.back();
    }
  }, [localStream, remoteStream]);

  const handleEndCall = async () => {
    await endCall();
    router.back();
  };

  const handleMinimize = () => {
    // Implement picture-in-picture mode if needed
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      
      {/* Remote video (main view) */}
      {remoteStream && isCallConnected ? (
        <RTCView
          style={styles.remoteVideo}
          streamURL={remoteStream.toURL()}
          objectFit="cover"
        />
      ) : (
        <View style={styles.remoteVideoPlaceholder}>
          <Text style={styles.connectingText}>
            {isCallConnected ? 'Connexion...' : 'En attente de réponse...'}
          </Text>
        </View>
      )}

      {/* Local video (small overlay) */}
      {localStream && (
        <View style={styles.localVideoContainer}>
          <RTCView
            style={styles.localVideo}
            streamURL={localStream.toURL()}
            objectFit="cover"
            mirror={true}
          />
        </View>
      )}

      {/* Top controls */}
      <View style={styles.topControls}>
        <TouchableOpacity 
          style={styles.topButton}
          onPress={handleMinimize}
        >
          <Minimize2 size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          {isMuted ? (
            <MicOff size={28} color="#FFFFFF" />
          ) : (
            <Mic size={28} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endCallButton}
          onPress={handleEndCall}
        >
          <PhoneOff size={32} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isCameraOff && styles.controlButtonActive]}
          onPress={toggleCamera}
        >
          {isCameraOff ? (
            <VideoOff size={28} color="#FFFFFF" />
          ) : (
            <Video size={28} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={switchCamera}
        >
          <RotateCcw size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    width: width,
    height: height,
  },
  remoteVideoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  connectingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  localVideo: {
    width: '100%',
    height: '100%',
  },
  topControls: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
  },
  topButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  controlButtonActive: {
    backgroundColor: Colors.status.error,
  },
  endCallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    elevation: 8,
    shadowColor: Colors.status.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
