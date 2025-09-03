import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { useCall } from '@/contexts/CallContext';
import { Phone, PhoneOff, Video } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export function IncomingCallModal() {
  const { 
    isIncomingCall, 
    callData, 
    acceptCall, 
    rejectCall 
  } = useCall();

  const handleAcceptCall = async () => {
    await acceptCall();
    
    if (callData?.type) {
      router.push('/call');
    }
  };

  const handleRejectCall = () => {
    rejectCall();
  };

  if (!isIncomingCall || !callData) {
    return null;
  }

  const getCallerName = () => {
    // This would typically come from your user data
    return `Utilisateur ${callData.callerId}`;
  };

  return (
    <Modal
      visible={isIncomingCall}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getCallerName().charAt(0).toUpperCase()}
              </Text>
            </View>
            
            <Text style={styles.callerName}>{getCallerName()}</Text>
            
            <Text style={styles.callType}>
              {callData.type === 'video' ? 'Appel vidéo entrant' : 'Appel audio entrant'}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleRejectCall}
            >
              <PhoneOff size={32} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAcceptCall}
            >
              {callData.type === 'video' ? (
                <Video size={32} color="#FFFFFF" />
              ) : (
                <Phone size={32} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
  },
  callerName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  callType: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rejectButton: {
    backgroundColor: Colors.status.error,
  },
  acceptButton: {
    backgroundColor: Colors.status.success,
  },
});
