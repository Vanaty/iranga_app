import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Message } from '@/types/chat';
import { MessageStatus } from '../MessageStatus';
import { File, Download, FileText, FileImage, FileVideo, Music } from 'lucide-react-native';

interface FileMessageProps {
  message: Message;
  isMyMessage: boolean;
  showTimestamp?: boolean;
}

export function FileMessage({ message, isMyMessage, showTimestamp = true }: FileMessageProps) {
  const [downloading, setDownloading] = useState(false);

  const messageTime = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const getFileInfo = () => {
    const url = message.media?.fileName || '';
    const fileName = url.split('/').pop() || 'Fichier';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    return { fileName, extension };
  };

  const getFileIcon = (extension: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'webm'];
    const audioExtensions = ['mp3', 'wav', 'aac', 'flac', 'ogg'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];

    if (imageExtensions.includes(extension)) {
      return <FileImage size={24} color="#25D366" />;
    } else if (videoExtensions.includes(extension)) {
      return <FileVideo size={24} color="#25D366" />;
    } else if (audioExtensions.includes(extension)) {
      return <Music size={24} color="#25D366" />;
    } else if (documentExtensions.includes(extension)) {
      return <FileText size={24} color="#25D366" />;
    } else {
      return <File size={24} color="#25D366" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    if (!message.media?.fileUrl) return;
    
    setDownloading(true);
    try {
      // Ici vous pourriez implémenter le téléchargement réel
      Alert.alert('Téléchargement', 'Fonctionnalité de téléchargement à implémenter');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de télécharger le fichier');
    } finally {
      setDownloading(false);
    }
  };

  const { fileName, extension } = getFileInfo();

  return (
    <View style={[
      styles.container,
      isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
    ]}>
      <View style={[
        styles.bubble,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMyMessage && (
          <Text style={styles.senderName}>
            {message.sender.firstName} {message.sender.lastName}
          </Text>
        )}
        
        <TouchableOpacity 
          style={styles.fileContainer}
          onPress={handleDownload}
          disabled={downloading}
        >
          <View style={styles.fileIcon}>
            {getFileIcon(extension)}
          </View>
          
          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {fileName}
            </Text>
            <Text style={styles.fileSize}>
              {/* Vous pouvez ajouter la taille du fichier si disponible */}
              {extension.toUpperCase()}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={handleDownload}
            disabled={downloading}
          >
            <Download 
              size={20} 
              color={downloading ? "#999999" : "#25D366"} 
            />
          </TouchableOpacity>
        </TouchableOpacity>
        
        {message.contentText && (
          <Text style={[
            styles.captionText,
            isMyMessage ? styles.myCaptionText : styles.otherCaptionText
          ]}>
            {message.contentText}
          </Text>
        )}
        
        <View style={styles.messageFooter}>
          {showTimestamp && (
            <Text style={[
              styles.timestamp,
              isMyMessage ? styles.myTimestamp : styles.otherTimestamp
            ]}>
              {messageTime}
            </Text>
          )}
          {isMyMessage && (
            <MessageStatus 
              sent={true}
              delivered={message.read}
              read={message.read}
            />
          )}
        </View>
      </View>
      
      {/* Queue de la bulle */}
      <View style={[
        styles.tail,
        isMyMessage ? styles.myTail : styles.otherTail
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 2,
    marginHorizontal: 8,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'relative',
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    marginRight: 8,
  },
  otherMessage: {
    backgroundColor: '#FFFFFF',
    marginLeft: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#25D366',
    marginBottom: 4,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#666666',
  },
  downloadButton: {
    padding: 8,
  },
  captionText: {
    fontSize: 16,
    lineHeight: 20,
    marginTop: 4,
  },
  myCaptionText: {
    color: '#000000',
  },
  otherCaptionText: {
    color: '#000000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    marginRight: 4,
  },
  myTimestamp: {
    color: '#666666',
  },
  otherTimestamp: {
    color: '#999999',
  },
  tail: {
    position: 'absolute',
    bottom: 0,
    width: 0,
    height: 0,
  },
  myTail: {
    right: 0,
    borderLeftWidth: 8,
    borderLeftColor: '#DCF8C6',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
  },
  otherTail: {
    left: 0,
    borderRightWidth: 8,
    borderRightColor: '#FFFFFF',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
  },
});
