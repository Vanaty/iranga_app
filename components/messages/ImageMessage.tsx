import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { Message } from '@/types/chat';
import { MessageStatus } from '../MessageStatus';
import { X, Download, Share } from 'lucide-react-native';
import { Config } from '@/config/Config';

interface ImageMessageProps {
  message: Message;
  isMyMessage: boolean;
  showTimestamp?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function ImageMessage({ message, isMyMessage, showTimestamp = true }: ImageMessageProps) {
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const messageTime = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const thumbnailSize = 200;

  const handleImagePress = () => {
    setShowFullImage(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const getFullImageUri = (imageName: string) => {
    return Config.API_BASE_URL.replace('/api','') + imageName;
  };

  return (
    <>
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
          
          <TouchableOpacity onPress={handleImagePress} style={styles.imageContainer}>
            {imageError ? (
              <View style={[styles.imagePlaceholder, { width: thumbnailSize, height: thumbnailSize }]}>
                <Text style={styles.errorText}>Image non disponible</Text>
              </View>
            ) : (
              <Image
                source={{ uri: getFullImageUri(message.media?.thumbnailUrl || '') }}
                style={[styles.thumbnail, { width: thumbnailSize, height: thumbnailSize }]}
                onLoad={handleImageLoad}
                onError={handleImageError}
                resizeMode="cover"
              />
            )}
            {imageLoading && (
              <View style={[styles.loadingOverlay, { width: thumbnailSize, height: thumbnailSize }]}>
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* {message.contentText && (
            <Text style={[
              styles.captionText,
              isMyMessage ? styles.myCaptionText : styles.otherCaptionText
            ]}>
              {message.contentText}
            </Text>
          )} */}
          
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

      {/* Modal pour l'image en plein écran */}
      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <View style={styles.fullImageModal}>
          <View style={styles.fullImageHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFullImage(false)}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.fullImageActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Download size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Share size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.fullImageContainer}>
            <Image
              source={{ uri: getFullImageUri(message.media?.fileUrl || '') }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
          
          {message.contentText && (
            <View style={styles.fullImageCaption}>
              <Text style={styles.fullImageCaptionText}>{message.contentText}</Text>
            </View>
          )}
        </View>
      </Modal>
    </>
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
    paddingHorizontal: 8,
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
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    borderRadius: 8,
  },
  imagePlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  errorText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  captionText: {
    fontSize: 16,
    lineHeight: 20,
    marginTop: 8,
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
  // Styles pour le modal plein écran
  fullImageModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  fullImageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  fullImageActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  fullImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: screenWidth,
    height: screenHeight - 200,
  },
  fullImageCaption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  fullImageCaptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});
