import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Modal,
  Text,
} from 'react-native';
import { Send, Mic, Plus, Camera, Image, FileText, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '@/constants/Colors';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onSendFile: (file: { uri: string; type: string; name: string }) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
}

export function ChatInput({ 
  onSendMessage, 
  onSendFile,
  onTyping, 
  placeholder = "Tapez votre message..." 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const handleTextChange = (text: string) => {
    setMessage(text);
    
    // Gérer l'indicateur de frappe
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      onTyping?.(false);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de l\'autorisation pour accéder à vos photos.');
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Nous avons besoin de l\'autorisation pour utiliser l\'appareil photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onSendFile({
        uri: asset.uri,
        type: 'image',
        name: `photo_${Date.now()}.jpg`,
      });
      setShowAttachmentMenu(false);
    }
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onSendFile({
        uri: asset.uri,
        type: 'image',
        name: asset.fileName || `image_${Date.now()}.jpg`,
      });
      setShowAttachmentMenu(false);
    }
  };

  const handlePickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      onSendFile({
        uri: asset.uri,
        type: 'video',
        name: asset.fileName || `video_${Date.now()}.mp4`,
      });
      setShowAttachmentMenu(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        onSendFile({
          uri: asset.uri,
          type: 'file',
          name: asset.name,
        });
        setShowAttachmentMenu(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du document:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
    }
  };

  const canSend = message.trim().length > 0;

  return (
    <>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={styles.attachButton}
            onPress={() => setShowAttachmentMenu(true)}
          >
            <Plus size={20} color="#666666" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor="#999999"
            multiline
            maxLength={1000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          
          <TouchableOpacity 
            style={[
              styles.sendButton,
              canSend ? styles.sendButtonActive : styles.micButton
            ]}
            onPress={canSend ? handleSend : undefined}
          >
            {canSend ? (
              <Send size={20} color="#FFFFFF" />
            ) : (
              <Mic size={20} color="#666666" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu des pièces jointes */}
      <Modal
        visible={showAttachmentMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentMenu}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAttachmentMenu(false)}
            >
              <X size={24} color="#666666" />
            </TouchableOpacity>
            
            <Text style={styles.menuTitle}>Envoyer un fichier</Text>
            
            <View style={styles.menuOptions}>
              <TouchableOpacity 
                style={styles.menuOption}
                onPress={handleTakePhoto}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#EF4444' }]}>
                  <Camera size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.optionText}>Prendre une photo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuOption}
                onPress={handlePickImage}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#8B5CF6' }]}>
                  <Image size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.optionText}>Galerie</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuOption}
                onPress={handlePickVideo}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#F59E0B' }]}>
                  <FileText size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.optionText}>Vidéo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuOption}
                onPress={handlePickDocument}
              >
                <View style={[styles.optionIcon, { backgroundColor: '#10B981' }]}>
                  <FileText size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.optionText}>Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.input,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.ui.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.background.card,
    borderRadius: 30,
    paddingHorizontal: 6,
    paddingVertical: 6,
    elevation: 4,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  attachButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: Colors.background.input,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.text.primary,
    fontWeight: '500',
    ...Platform.select({
      ios: {
        paddingTop: 12,
      },
    }),
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    elevation: 2,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sendButtonActive: {
    backgroundColor: Colors.primary.main,
  },
  micButton: {
    backgroundColor: Colors.background.input,
  },
  // Styles pour le modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.ui.overlay,
    justifyContent: 'flex-end',
  },
  attachmentMenu: {
    backgroundColor: Colors.background.card,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 45,
    elevation: 12,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    borderRadius: 20,
    backgroundColor: Colors.background.input,
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 25,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  menuOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  menuOption: {
    alignItems: 'center',
    width: '22%',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  optionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },
});
